// Reglas de autenticación y cuentas.

// Paquete de la clase.
package cl.nutrivida.autenticacion.service;

// Importa StandardCharsets.
import java.nio.charset.StandardCharsets;
// Importa los tipos del paquete.
import java.security.*;
// Importa los tipos del paquete.
import java.time.*;
// Importa los tipos del paquete.
import java.util.*;
// Importa los tipos del paquete.
import cl.nutrivida.autenticacion.dto.*;
// Importa los tipos del paquete.
import cl.nutrivida.autenticacion.model.*;
// Importa los tipos del paquete.
import cl.nutrivida.autenticacion.repository.*;
// Importa ApiException.
import cl.nutrivida.autenticacion.exceptions.ApiException;
// Importa RequiredArgsConstructor.
import lombok.RequiredArgsConstructor;
// Importa Slf4j.
import lombok.extern.slf4j.Slf4j;
// Importa Value.
import org.springframework.beans.factory.annotation.Value;
// Importa HttpStatus.
import org.springframework.http.HttpStatus;
// Importa PasswordEncoder.
import org.springframework.security.crypto.password.PasswordEncoder;
// Importa los tipos del paquete.
import org.springframework.security.oauth2.jwt.*;
// Importa Service.
import org.springframework.stereotype.Service;
// Importa Transactional.
import org.springframework.transaction.annotation.Transactional;

// Registra esta clase como servicio de reglas de negocio.
@Service
// Lombok genera el logger log para dejar trazas de eventos.
@Slf4j
// Genera el constructor de dependencias.
@RequiredArgsConstructor
// Aplica una transacción al servicio.
@Transactional
// Define la clase.
public class AutenticacionService {
    // Repositorio de cuentas: permite buscar, comprobar correos y guardar usuarios en PostgreSQL.
    private final UsuarioRepository usuarios;
    // Repositorio que consulta los roles inicializados por Flyway.
    private final RolRepository roles;
    // Repositorio que consulta los estados de cuenta definidos en la base.
    private final EstadoUsuarioRepository estados;
    // Repositorio que guarda, bloquea y revoca los tokens de renovación.
    private final TokenRenovacionRepository tokens;
    // Mapper que convierte entidades internas a DTO para las respuestas de la API.
    private final UsuarioMapper mapper;
    // Componente BCrypt que calcula hashes y compara contraseñas sin descifrarlas.
    private final PasswordEncoder passwordEncoder;
    // Firmador que produce JWT usando la clave privada configurada.
    private final JwtEncoder jwtEncoder;
    // Lee la propiedad de configuración.
    @Value("${app.jwt.issuer}") private String issuer;
    // Lee la propiedad de configuración.
    @Value("${app.jwt.access-token-duration:15m}") private Duration acceso;
    // Lee la propiedad de configuración.
    @Value("${app.jwt.refresh-token-duration:7d}") private Duration renovacion;
    // El operador configura el rol de nuevas cuentas; el formulario nunca lo elige.
    @Value("${app.registration.default-role:CLIENTE}") private String rolRegistro = "CLIENTE";
    // El estado inicial también pertenece a la configuración del servicio.
    @Value("${app.registration.default-state:ACTIVO}") private String estadoRegistro = "ACTIVO";

    // Recibe datos de registro y crea una cuenta cliente.
    public UsuarioDTO registrar(RegistroDTO dto) {
        // Normaliza el correo recibido.
        String correo = normalizar(dto.correo());
        // Comprueba el límite de bytes de BCrypt.
        validarPassword(dto.password());
        // Si el correo ya existe, interrumpe el registro con HTTP 409 antes de intentar guardar otra cuenta.
        if (usuarios.existsByCorreo(correo)) throw new ApiException(HttpStatus.CONFLICT, "El correo ya está registrado");
        // Crea en memoria la entidad de la nueva cuenta.
        Usuario usuario = new Usuario();
        // Asigna a la entidad el correo normalizado.
        usuario.setCorreo(correo);
        // Calcula el hash BCrypt con salt y lo asigna a la entidad.
        usuario.setPasswordHash(passwordEncoder.encode(dto.password()));
        // Busca el rol configurado en el servidor, sin aceptar privilegios del navegador.
        usuario.setRol(roles.findByNombre(rolRegistro).orElseThrow(() -> new IllegalStateException("Rol inicial no configurado en la base")));
        // Usa un estado existente: la configuración no crea datos de referencia implícitos.
        usuario.setEstadoUsuario(estados.findByNombre(estadoRegistro).orElseThrow(() -> new IllegalStateException("Estado inicial no configurado en la base")));
        // Pide a JPA guardar la cuenta y conserva la entidad devuelta con su identificador.
        Usuario guardado = usuarios.save(usuario);
        // Registra el evento y el identificador con un marcador {} para seguimiento.
        log.info("Cuenta de cliente creada: {}", guardado.getId());
        // Convierte la entidad guardada a su respuesta pública.
        return mapper.toDTO(guardado);
    }

    // Recibe credenciales e inicia sesión si la cuenta y la contraseña son válidas.
    public SesionDTO login(LoginDTO dto) {
        // Busca la cuenta por el correo normalizado.
        Usuario usuario = usuarios.findByCorreo(normalizar(dto.correo()))
            // Devuelve 401 si la cuenta no existe.
            .orElseThrow(AutenticacionService::credencialesInvalidas);
        // Rechaza credenciales o cuentas inactivas.
        if (!passwordEncoder.matches(dto.password(), usuario.getPasswordHash()) || !activo(usuario))
            // Interrumpe la operación con HTTP 401 sin revelar si falló el correo, la clave o el estado de la cuenta.
            throw credencialesInvalidas();
        // Emite los tokens de una nueva sesión.
        return sesion(usuario, UUID.randomUUID(), null);
    }

    // Recibe el secreto de renovación y emite su reemplazo después de comprobarlo.
    public SesionDTO renovar(String token) {
        // Calcula SHA-256 del token recibido y busca su registro con bloqueo de escritura.
        TokenRenovacion anterior = tokens.buscarParaRenovar(hash(token)).orElseThrow(AutenticacionService::credencialesInvalidas);
        // Impide renovar si el token ya fue revocado, está vencido o su usuario dejó de estar activo.
        if (anterior.getRevocadoEn() != null || !anterior.getExpiraEn().isAfter(Instant.now()) || !activo(anterior.getUsuario()))
            // Interrumpe la operación con HTTP 401 sin revelar si falló el correo, la clave o el estado de la cuenta.
            throw credencialesInvalidas();
        // Marca el token anterior como usado: después de guardar la transacción no podrá renovar otra vez.
        anterior.setRevocadoEn(Instant.now());
        // Genera el reemplazo para el mismo usuario y familia, conservando el vínculo con el token anterior.
        return sesion(anterior.getUsuario(), anterior.getFamiliaId(), anterior);
    }

    // Cierra la posibilidad de renovar esa sesión.
    public void logout(String token) {
        // Busca por hash y ejecuta la lambda solo si existe el token.
        tokens.buscarParaRenovar(hash(token)).ifPresent(t -> {
            // Revoca únicamente un token todavía vigente.
            if (t.getRevocadoEn() == null) t.setRevocadoEn(Instant.now());
        });
    }

    // Ejecuta este método en una transacción de lectura.
    @Transactional(readOnly = true)
    // Consulta un registro por su identificador y devuelve una representación DTO.
    public UsuarioDTO obtener(UUID id) { return mapper.toDTO(buscar(id)); }

    // Ejecuta este método en una transacción de lectura.
    @Transactional(readOnly = true)
    // Devuelve la lista de registros.
    public List<UsuarioDTO> listar() { return usuarios.findAll().stream().map(mapper::toDTO).toList(); }

    // Actualiza los datos permitidos después de validar el registro y los valores solicitados.
    public UsuarioDTO actualizar(UUID id, String rol, String estado) {
        // Recupera la cuenta por UUID o devuelve el error 404 definido en buscar.
        Usuario usuario = buscar(id);
        // Busca el rol solicitado y lo asigna.
        usuario.setRol(roles.findByNombre(rol).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Rol inválido")));
        // Busca y asigna el estado solicitado.
        usuario.setEstadoUsuario(estados.findByNombre(estado).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Estado inválido")));
        // Revoca las renovaciones de esa cuenta.
        tokens.revocarPorUsuario(id);
        // Registra el evento y el identificador con un marcador {} para seguimiento.
        log.info("Permisos actualizados y renovaciones revocadas para cuenta {}", id);
        // Devuelve los datos públicos de la cuenta.
        return mapper.toDTO(usuario);
    }

    // Borrado lógico: conserva la trazabilidad y revoca las renovaciones.
    // Realiza una baja lógica: cambia la cuenta a INACTIVO y revoca sus renovaciones, conservando el historial.
    public void desactivar(UUID id) { actualizar(id, buscar(id).getRol().getNombre(), "INACTIVO"); }

    // Método interno que recupera una entidad o interrumpe la operación si no existe.
    private Usuario buscar(UUID id) {
        // Busca la entidad por su UUID.
        return usuarios.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    // Método interno que firma el JWT y crea el registro del secreto de renovación.
    private SesionDTO sesion(Usuario usuario, UUID familia, TokenRenovacion anterior) {
        // Captura un instante de la línea de tiempo para usar una referencia temporal coherente en esta operación.
        Instant ahora = Instant.now();
        // Empieza el contenido del JWT: iss identifica al emisor y sub identifica al usuario mediante su UUID.
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer(issuer).subject(usuario.getId().toString())
            // Añade fecha de emisión, fecha de vencimiento y un identificador único del JWT.
            .issuedAt(ahora).expiresAt(ahora.plus(acceso)).id(UUID.randomUUID().toString())
            // Guarda el rol actual de la base dentro de una lista y termina el contenido que se firmará.
            .claim("roles", List.of(usuario.getRol().getNombre())).build();
        // Firma los claims con RSA y obtiene la cadena JWT que se enviará como token de acceso.
        String jwt = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
        // Reserva 48 bytes, equivalentes a 384 bits, para el secreto aleatorio de renovación.
        byte[] bytes = new byte[48];
        // Llena el arreglo usando un generador apto para secretos criptográficos.
        new SecureRandom().nextBytes(bytes);
        // Convierte los bytes aleatorios a texto Base64 URL sin relleno.
        String refresh = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        // Prepara el registro persistente que permitirá verificar y revocar el nuevo token de renovación.
        TokenRenovacion nuevo = new TokenRenovacion();
        // Relaciona el token con la cuenta propietaria.
        nuevo.setUsuario(usuario);
        // Conserva el identificador de la cadena de renovaciones de esta sesión.
        nuevo.setFamiliaId(familia);
        // Guarda únicamente el SHA-256 del secreto.
        nuevo.setTokenHash(hash(refresh));
        // Calcula la fecha límite del token de renovación sumando su duración configurada, por defecto siete días.
        nuevo.setExpiraEn(ahora.plus(renovacion));
        // Inserta el token y envía los cambios pendientes a PostgreSQL dentro de la transacción.
        tokens.saveAndFlush(nuevo);
        // Enlaza el token anterior con su reemplazo.
        if (anterior != null) anterior.setReemplazadoPor(nuevo);
        // Devuelve los tokens y la cuenta.
        return new SesionDTO(jwt, refresh, "Bearer", acceso.toSeconds(), mapper.toDTO(usuario));
    }

    // Normaliza el correo con Locale.ROOT.
    private static String normalizar(String correo) { return correo.strip().toLowerCase(Locale.ROOT); }
    // Comprueba que el nombre del estado de la cuenta sea exactamente ACTIVO.
    private static boolean activo(Usuario u) { return "ACTIVO".equals(u.getEstadoUsuario().getNombre()); }
    // Construye el error genérico HTTP 401 utilizado cuando no se puede acreditar una sesión válida.
    private static ApiException credencialesInvalidas() { return new ApiException(HttpStatus.UNAUTHORIZED, "Credenciales o sesión inválidas"); }
    // Comprueba que la contraseña pueda procesarse sin superar el límite de bytes de BCrypt.
    private static void validarPassword(String password) {
        // Mide el largo real en bytes UTF-8.
        if (password.getBytes(StandardCharsets.UTF_8).length > 72)
            // Rechaza la contraseña demasiado larga con HTTP 400 antes de calcular BCrypt.
            throw new ApiException(HttpStatus.BAD_REQUEST, "La contraseña supera 72 bytes");
    }
    // Transforma el secreto de renovación en su huella SHA-256 para su búsqueda y almacenamiento.
    private static String hash(String token) {
        // Calcula SHA-256 del token codificado en UTF-8 y lo representa en 64 caracteres hexadecimales.
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8))); }
        // Convierte en error interno el caso excepcional de que el entorno Java no disponga del algoritmo SHA-256.
        catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
}

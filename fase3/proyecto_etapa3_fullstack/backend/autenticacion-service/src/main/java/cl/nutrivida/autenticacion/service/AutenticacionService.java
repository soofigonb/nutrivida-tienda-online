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
@Slf4j
// Genera el constructor de dependencias.
@RequiredArgsConstructor
// Aplica una transacción al servicio.
@Transactional
// Define la clase.
public class AutenticacionService {
    private final UsuarioRepository usuarios;
    private final RolRepository roles;
    private final EstadoUsuarioRepository estados;
    private final TokenRenovacionRepository tokens;
    private final UsuarioMapper mapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    // Lee la propiedad de configuración.
    @Value("${app.jwt.issuer}") private String issuer;
    // Lee la propiedad de configuración.
    @Value("${app.jwt.access-token-duration:15m}") private Duration acceso;
    // Lee la propiedad de configuración.
    @Value("${app.jwt.refresh-token-duration:7d}") private Duration renovacion;
    @Value("${app.registration.default-role:CLIENTE}") private String rolRegistro = "CLIENTE";
    @Value("${app.registration.default-state:ACTIVO}") private String estadoRegistro = "ACTIVO";

    // Recibe datos de registro y crea una cuenta cliente.
    public UsuarioDTO registrar(RegistroDTO dto) {
        // Normaliza el correo recibido.
        String correo = normalizar(dto.correo());
        // Comprueba el límite de bytes de BCrypt.
        validarPassword(dto.password());
        // Rechaza correos duplicados.
        if (usuarios.existsByCorreo(correo)) throw new ApiException(HttpStatus.CONFLICT, "El correo ya está registrado");
        // Crea en memoria la entidad de la nueva cuenta.
        Usuario usuario = new Usuario();
        // Asigna a la entidad el correo normalizado.
        usuario.setCorreo(correo);
        usuario.setPasswordHash(passwordEncoder.encode(dto.password()));
        // Asigna el rol del servidor.
        usuario.setRol(roles.findByNombre(rolRegistro).orElseThrow(() -> new IllegalStateException("Rol inicial no configurado en la base")));
        usuario.setEstadoUsuario(estados.findByNombre(estadoRegistro).orElseThrow(() -> new IllegalStateException("Estado inicial no configurado en la base")));
        Usuario guardado = usuarios.save(usuario);
        log.info("Cuenta de cliente creada: {}", guardado.getId());
        // Convierte la entidad guardada a su respuesta pública.
        return mapper.toDTO(guardado);
    }

    public SesionDTO login(LoginDTO dto) {
        // Busca la cuenta por el correo normalizado.
        Usuario usuario = usuarios.findByCorreo(normalizar(dto.correo()))
            // Devuelve 401 si la cuenta no existe.
            .orElseThrow(AutenticacionService::credencialesInvalidas);
        // Rechaza credenciales o cuentas inactivas.
        if (!passwordEncoder.matches(dto.password(), usuario.getPasswordHash()) || !activo(usuario))
            throw credencialesInvalidas();
        // Emite los tokens de una nueva sesión.
        return sesion(usuario, UUID.randomUUID(), null);
    }

    public SesionDTO renovar(String token) {
        // Busca y bloquea el token por hash.
        TokenRenovacion anterior = tokens.buscarParaRenovar(hash(token)).orElseThrow(AutenticacionService::credencialesInvalidas);
        // Valida token y cuenta activa.
        if (anterior.getRevocadoEn() != null || !anterior.getExpiraEn().isAfter(Instant.now()) || !activo(anterior.getUsuario()))
            throw credencialesInvalidas();
        // Invalida el token usado.
        anterior.setRevocadoEn(Instant.now());
        // Conserva la familia del token.
        return sesion(anterior.getUsuario(), anterior.getFamiliaId(), anterior);
    }

    // Cierra la posibilidad de renovar esa sesión.
    public void logout(String token) {
        tokens.buscarParaRenovar(hash(token)).ifPresent(t -> {
            // Revoca únicamente un token todavía vigente.
            if (t.getRevocadoEn() == null) t.setRevocadoEn(Instant.now());
        });
    }

    // Ejecuta este método en una transacción de lectura.
    @Transactional(readOnly = true)
    public UsuarioDTO obtener(UUID id) { return mapper.toDTO(buscar(id)); }

    // Ejecuta este método en una transacción de lectura.
    @Transactional(readOnly = true)
    // Devuelve la lista de registros.
    public List<UsuarioDTO> listar() { return usuarios.findAll().stream().map(mapper::toDTO).toList(); }

    public UsuarioDTO actualizar(UUID id, String rol, String estado) {
        Usuario usuario = buscar(id);
        // Busca el rol solicitado y lo asigna.
        usuario.setRol(roles.findByNombre(rol).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Rol inválido")));
        // Busca y asigna el estado solicitado.
        usuario.setEstadoUsuario(estados.findByNombre(estado).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Estado inválido")));
        // Revoca las renovaciones de esa cuenta.
        tokens.revocarPorUsuario(id);
        log.info("Permisos actualizados y renovaciones revocadas para cuenta {}", id);
        // Devuelve los datos públicos de la cuenta.
        return mapper.toDTO(usuario);
    }

    // Desactiva la cuenta y revoca sesiones.
    public void desactivar(UUID id) { actualizar(id, buscar(id).getRol().getNombre(), "INACTIVO"); }

    private Usuario buscar(UUID id) {
        // Busca la entidad por su UUID.
        return usuarios.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    // Firma el JWT y crea la renovación.
    private SesionDTO sesion(Usuario usuario, UUID familia, TokenRenovacion anterior) {
        Instant ahora = Instant.now();
        // Identifica el emisor y el usuario.
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer(issuer).subject(usuario.getId().toString())
            .issuedAt(ahora).expiresAt(ahora.plus(acceso)).id(UUID.randomUUID().toString())
            .claim("roles", List.of(usuario.getRol().getNombre())).build();
        String jwt = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
        // Reserva 48 bytes para el secreto.
        byte[] bytes = new byte[48];
        // Genera un secreto criptográfico.
        new SecureRandom().nextBytes(bytes);
        // Codifica en Base64 URL.
        String refresh = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        TokenRenovacion nuevo = new TokenRenovacion();
        // Relaciona el token con la cuenta propietaria.
        nuevo.setUsuario(usuario);
        nuevo.setFamiliaId(familia);
        // Guarda únicamente el SHA-256 del secreto.
        nuevo.setTokenHash(hash(refresh));
        nuevo.setExpiraEn(ahora.plus(renovacion));
        tokens.saveAndFlush(nuevo);
        // Enlaza el token anterior con su reemplazo.
        if (anterior != null) anterior.setReemplazadoPor(nuevo);
        // Devuelve los tokens y la cuenta.
        return new SesionDTO(jwt, refresh, "Bearer", acceso.toSeconds(), mapper.toDTO(usuario));
    }

    // Normaliza el correo con Locale.ROOT.
    private static String normalizar(String correo) { return correo.strip().toLowerCase(Locale.ROOT); }
    private static boolean activo(Usuario u) { return "ACTIVO".equals(u.getEstadoUsuario().getNombre()); }
    private static ApiException credencialesInvalidas() { return new ApiException(HttpStatus.UNAUTHORIZED, "Credenciales o sesión inválidas"); }
    // Valida el límite de BCrypt.
    private static void validarPassword(String password) {
        // Mide el largo real en bytes UTF-8.
        if (password.getBytes(StandardCharsets.UTF_8).length > 72)
            throw new ApiException(HttpStatus.BAD_REQUEST, "La contraseña supera 72 bytes");
    }
    // Guarda una huella SHA-256.
    private static String hash(String token) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
}

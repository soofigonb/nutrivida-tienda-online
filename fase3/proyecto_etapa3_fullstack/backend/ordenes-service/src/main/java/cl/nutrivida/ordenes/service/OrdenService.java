// Concentra cálculo de precios, idempotencia, propiedad y transiciones de estado de las órdenes.

// Paquete de la clase.
package cl.nutrivida.ordenes.service;

// Importa los tipos del paquete.
import java.math.*;
// Importa los tipos del paquete.
import java.util.*;
// Importa el contrato comercial independiente de cualquier catálogo concreto.
import cl.nutrivida.ordenes.port.CatalogoPort;
// Importa los tipos del paquete.
import cl.nutrivida.ordenes.dto.*;
// Importa los tipos del paquete.
import cl.nutrivida.ordenes.model.*;
// Importa OrdenRepository.
import cl.nutrivida.ordenes.repository.OrdenRepository;
// Importa ApiException.
import cl.nutrivida.ordenes.exceptions.ApiException;
// Importa RequiredArgsConstructor.
import lombok.RequiredArgsConstructor;
// Importa Slf4j.
import lombok.extern.slf4j.Slf4j;
// Importa HttpStatus.
import org.springframework.http.HttpStatus;
// Importa Jwt.
import org.springframework.security.oauth2.jwt.Jwt;
// Importa Service.
import org.springframework.stereotype.Service;
// Importa Transactional.
import org.springframework.transaction.annotation.Transactional;

// Registra esta clase como servicio de reglas de negocio.
@Service @RequiredArgsConstructor @Transactional @Slf4j
// Define la clase.
public class OrdenService {
    // Repositorio JPA de órdenes.
    private final OrdenRepository repository;
    // Mapper que convierte entidades internas a DTO para las respuestas de la API.
    private final OrdenMapper mapper;
    // Contrato comercial: otro proyecto puede aportar su propio adaptador de catálogo.
    private final CatalogoPort catalogo;

    // Construye y persiste una orden usando el usuario del JWT y los precios confirmados por catálogo.
    public OrdenDTO crear(CrearOrdenDTO dto, Jwt jwt) {
        // Obtiene el UUID propietario desde sub del JWT validado.
        UUID usuario = UUID.fromString(jwt.getSubject());
        // Busca si ese usuario ya envió la misma clave de idempotencia para evitar una segunda orden al reintentar.
        Optional<Orden> previa = repository.findByIdUsuarioAndClaveIdempotencia(usuario, dto.claveIdempotencia());
        // Entra en el tratamiento del reintento si ya existe una orden para esa clave.
        if (previa.isPresent()) {
            // Recupera la orden existente después de comprobar que Optional contiene un resultado.
            Orden orden = previa.get();
            // Prepara un mapa idPlan → cantidad con el contenido de la orden que ya se guardó.
            Map<Long, Integer> original = new HashMap<>();
            // Agrupa los detalles guardados por artículo.
            orden.getDetalles().forEach(d -> original.put(d.getIdPlan(), d.getCantidad()));
            // Prepara otro mapa para comparar el contenido de la solicitud que se está reintentando.
            Map<Long, Integer> solicitud = new HashMap<>();
            // Agrupa los detalles recibidos por artículo.
            dto.detalles().forEach(d -> solicitud.put(d.idItem(), d.cantidad()));
            // Detecta si se reutilizó la misma clave con cantidades, planes o duplicados diferentes.
            if (!original.equals(solicitud) || dto.detalles().size() != original.size())
                // Rechaza con 409 una clave de idempotencia que ya pertenece a otra solicitud.
                throw new ApiException(HttpStatus.CONFLICT, "La clave ya se usó con otros datos");
            // Devuelve la representación de la orden sin exponer la entidad JPA.
            return mapper.toDTO(orden);
        }
        // Crea la cabecera de una orden nueva en memoria.
        Orden orden = new Orden();
        // Asigna el propietario obtenido del JWT.
        orden.setIdUsuario(usuario);
        // Guarda la clave del intento.
        orden.setClaveIdempotencia(dto.claveIdempotencia());
        // Inicializa el total en cero usando aritmética decimal exacta para los montos.
        BigDecimal total = BigDecimal.ZERO;
        // Crea un conjunto que detectará identificadores de plan repetidos sin recorrer de nuevo toda la lista.
        Set<Long> ids = new HashSet<>();
        // Recorre los planes y cantidades solicitados para validarlos y calcular cada detalle.
        for (CrearOrdenDTO.ItemDTO item : dto.detalles()) {
            // Set.add devuelve false si el identificador ya estaba.
            if (!ids.add(item.idItem())) throw new ApiException(HttpStatus.BAD_REQUEST, "No repita un artículo en la orden");
            // Consulta el artículo por el contrato independiente; el adaptador conoce la API externa.
            CatalogoPort.ProductoDTO articulo = catalogo.consultar(item.idItem(), jwt.getTokenValue());
            // Inicia la validación de la respuesta: debe existir, corresponder al plan solicitado y estar activo.
            if (articulo == null || !item.idItem().equals(articulo.id()) || !Boolean.TRUE.equals(articulo.activo()) ||
                // Valida el nombre del artículo.
                articulo.nombre() == null || articulo.nombre().isBlank() || articulo.nombre().length() > 150 ||
                // Completa la condición: el precio debe existir y no ser negativo.
                articulo.precio() == null || articulo.precio().signum() < 0)
                // Interrumpe la creación de la orden si el catálogo devolvió un plan que no cumple las reglas anteriores.
                throw new ApiException(HttpStatus.BAD_REQUEST, "Artículo no disponible");
            // Declara el precio que se utilizará una vez comprobado que representa pesos chilenos enteros.
            BigDecimal precio;
            // Exige cero decimales sin redondear.
            try { precio = articulo.precio().setScale(0, RoundingMode.UNNECESSARY); }
            // Rechaza precios incompatibles con el contrato.
            catch (ArithmeticException e) { throw new ApiException(HttpStatus.BAD_GATEWAY, "El catálogo debe entregar precios enteros en CLP"); }
            // Crea el detalle que conservará el plan, la cantidad y el precio al momento de la orden.
            DetalleOrden detalle = new DetalleOrden();
            // Relaciona el detalle con su cabecera y copia el identificador y el nombre del plan validado.
            detalle.setOrden(orden); detalle.setIdPlan(articulo.id()); detalle.setNombrePlan(articulo.nombre());
            // Copia la cantidad solicitada y el precio unitario confirmado por catálogo.
            detalle.setCantidad(item.cantidad()); detalle.setPrecioUnitario(precio);
            // Añade el detalle a la colección de la orden.
            orden.getDetalles().add(detalle);
            // Multiplica precio unitario por cantidad y suma el subtotal al acumulado usando BigDecimal.
            total = total.add(precio.multiply(BigDecimal.valueOf(item.cantidad())));
        }
        // Comprueba que el total no supere los doce dígitos enteros permitidos por NUMERIC(12,0).
        if (total.compareTo(new BigDecimal("999999999999")) > 0)
            // Rechaza con 400 un total que no cabe en la columna SQL.
            throw new ApiException(HttpStatus.BAD_REQUEST, "La orden supera el monto permitido");
        // Asigna a la cabecera el total calculado completamente en el backend.
        orden.setTotal(total);
        // Inserta la orden y sus detalles, y fuerza el envío de SQL antes de preparar la respuesta.
        Orden guardada = repository.saveAndFlush(orden);
        // Registra el evento y el identificador con un marcador {} para seguimiento.
        log.info("Orden creada: {}", guardada.getId());
        // Convierte la orden persistida a un DTO apto para devolver como JSON.
        return mapper.toDTO(guardada);
    }

    // Ejecuta este método en una transacción de lectura.
    @Transactional(readOnly = true)
    // Consulta los registros permitidos y devuelve una lista de DTO.
    public List<OrdenDTO> listar(Jwt jwt) {
        // El operador ternario elige: para un cliente consulta solo sus órdenes.
        List<Orden> ordenes = personal(jwt) ? repository.findByIdUsuarioOrderByCreadoEnDesc(UUID.fromString(jwt.getSubject())) : repository.findAll();
        // Convierte cada entidad de la lista a DTO mediante el mapper y reúne los resultados en otra lista.
        return ordenes.stream().map(mapper::toDTO).toList();
    }

    // Ejecuta este método en una transacción de lectura.
    @Transactional(readOnly = true)
    // Consulta un registro por su identificador y devuelve una representación DTO.
    public OrdenDTO obtener(UUID id, Jwt jwt) { return mapper.toDTO(buscarAutorizada(id, jwt)); }

    // Aplica una transición permitida a una orden sobre la que el usuario tiene acceso.
    public OrdenDTO cambiarEstado(UUID id, EstadoOrden estado, Jwt jwt) {
        // Busca la orden y comprueba que el usuario tenga permiso para verla antes de modificar su estado.
        Orden orden = buscarAutorizada(id, jwt);
        // Si el estado pedido ya está aplicado, devuelve el resultado actual: repetir la misma operación es inocuo.
        if (orden.getEstado() == estado) return mapper.toDTO(orden);
        // Solo permite salir de PENDIENTE hacia un estado final.
        if (orden.getEstado() != EstadoOrden.PENDIENTE || estado == EstadoOrden.PENDIENTE)
            // Devuelve 409 cuando la transición de estado entra en conflicto con el estado actual.
            throw new ApiException(HttpStatus.CONFLICT, "La orden ya no admite este cambio de estado");
        // Actualiza la entidad administrada por JPA.
        orden.setEstado(estado);
        // Registra el evento y el identificador con un marcador {} para seguimiento.
        log.info("Estado de orden {} actualizado a {}", id, estado);
        // Devuelve la representación de la orden sin exponer la entidad JPA.
        return mapper.toDTO(orden);
    }

    // Comprueba la existencia de la orden y limita la lectura a su dueño cuando corresponde.
    private Orden buscarAutorizada(UUID id, Jwt jwt) {
        // Busca la orden por UUID y responde 404 si no está registrada.
        Orden orden = repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Orden no encontrada"));
        // Comprueba el propietario de la orden.
        if (personal(jwt) && !orden.getIdUsuario().toString().equals(jwt.getSubject()))
            // Devuelve 404 para órdenes ajenas.
            throw new ApiException(HttpStatus.NOT_FOUND, "Orden no encontrada");
        // Devuelve la entidad después de superar la comprobación de existencia y propiedad.
        return orden;
    }

    // Determina si el JWT debe limitarse a las órdenes propias, en vez de tener consulta global.
    private boolean personal(Jwt jwt) {
        // Lee los roles del JWT validado como una lista de texto.
        List<String> roles = jwt.getClaimAsStringList("roles");
        // Limita a acceso personal si faltan roles o no contiene ninguno de los dos roles con consulta global.
        return roles == null || (!roles.contains("ADMINISTRADOR") && !roles.contains("VENDEDOR"));
    }
}

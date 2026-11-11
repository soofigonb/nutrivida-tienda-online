// Reglas de negocio de órdenes.

// Paquete de la clase.
package cl.nutrivida.ordenes.service;

// Importa los tipos del paquete.
import java.math.*;
// Importa los tipos del paquete.
import java.util.*;
import cl.nutrivida.ordenes.port.CatalogoPort;
import cl.nutrivida.ordenes.client.AgendamientoClient;
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
    private final OrdenMapper mapper;
    private final CatalogoPort catalogo;
    private final AgendamientoClient agendamiento;

    public OrdenDTO crear(CrearOrdenDTO dto, Jwt jwt) {
        return crear(dto, jwt, true);
    }

    public OrdenDTO preparar(CrearOrdenDTO dto, Jwt jwt) {
        return crear(dto, jwt, false);
    }

    private OrdenDTO crear(CrearOrdenDTO dto, Jwt jwt, boolean publicada) {
        // Obtiene el UUID propietario desde sub del JWT validado.
        UUID usuario = UUID.fromString(jwt.getSubject());
        // Detecta reintentos por usuario.
        Optional<Orden> previa = repository.findByIdUsuarioAndClaveIdempotencia(usuario, dto.claveIdempotencia());
        if (previa.isPresent()) {
            Orden orden = previa.get();
            if (publicada && !orden.isPublicada())
                throw new ApiException(HttpStatus.CONFLICT, "La solicitud aún tiene citas pendientes");
            Map<Long, Integer> original = new HashMap<>();
            // Agrupa los detalles guardados por artículo.
            orden.getDetalles().forEach(d -> original.put(d.getIdPlan(), d.getCantidad()));
            Map<Long, Integer> solicitud = new HashMap<>();
            // Agrupa los detalles recibidos por artículo.
            dto.detalles().forEach(d -> solicitud.put(d.idItem(), d.cantidad()));
            // Rechaza cambios en un reintento.
            if (!original.equals(solicitud) || dto.detalles().size() != original.size())
                throw new ApiException(HttpStatus.CONFLICT, "La clave ya se usó con otros datos");
            return mapper.toDTO(orden);
        }
        // Crea la cabecera de una orden nueva en memoria.
        Orden orden = new Orden();
        orden.setPublicada(publicada);
        // Asigna el propietario obtenido del JWT.
        orden.setIdUsuario(usuario);
        // Guarda la clave del intento.
        orden.setClaveIdempotencia(dto.claveIdempotencia());
        // Usa aritmética decimal.
        BigDecimal total = BigDecimal.ZERO;
        // Detecta artículos duplicados.
        Set<Long> ids = new HashSet<>();
        for (CrearOrdenDTO.ItemDTO item : dto.detalles()) {
            // Set.add devuelve false si el identificador ya estaba.
            if (!ids.add(item.idItem())) throw new ApiException(HttpStatus.BAD_REQUEST, "No repita un artículo en la orden");
            CatalogoPort.ProductoDTO articulo = catalogo.consultar(item.idItem(), jwt.getTokenValue());
            // Valida disponibilidad y precio.
            if (articulo == null || !item.idItem().equals(articulo.id()) || !Boolean.TRUE.equals(articulo.activo()) ||
                // Valida el nombre del artículo.
                articulo.nombre() == null || articulo.nombre().isBlank() || articulo.nombre().length() > 150 ||
                articulo.precio() == null || articulo.precio().signum() < 0)
                throw new ApiException(HttpStatus.BAD_REQUEST, "Artículo no disponible");
            // Exige precios enteros en CLP.
            BigDecimal precio;
            // Exige cero decimales sin redondear.
            try { precio = articulo.precio().setScale(0, RoundingMode.UNNECESSARY); }
            // Rechaza precios incompatibles con el contrato.
            catch (ArithmeticException e) { throw new ApiException(HttpStatus.BAD_GATEWAY, "El catálogo debe entregar precios enteros en CLP"); }
            // Conserva el precio de compra.
            DetalleOrden detalle = new DetalleOrden();
            detalle.setOrden(orden); detalle.setIdPlan(articulo.id()); detalle.setNombrePlan(articulo.nombre());
            detalle.setCantidad(item.cantidad()); detalle.setPrecioUnitario(precio);
            // Añade el detalle a la colección de la orden.
            orden.getDetalles().add(detalle);
            total = total.add(precio.multiply(BigDecimal.valueOf(item.cantidad())));
        }
        // Valida el límite de la columna.
        if (total.compareTo(new BigDecimal("999999999999")) > 0)
            // Rechaza con 400 un total que no cabe en la columna SQL.
            throw new ApiException(HttpStatus.BAD_REQUEST, "La orden supera el monto permitido");
        orden.setTotal(total);
        // Persiste la orden y sus detalles.
        Orden guardada = repository.saveAndFlush(orden);
        log.info(publicada ? "Orden creada: {}" : "Solicitud de reserva preparada: {}", guardada.getId());
        return mapper.toDTO(guardada);
    }

    // Ejecuta este método en una transacción de lectura.
    @Transactional(readOnly = true)
    public List<OrdenDTO> listar(Jwt jwt) {
        // Limita al cliente a sus órdenes.
        List<Orden> ordenes = personal(jwt)
                ? repository.findByIdUsuarioAndPublicadaTrueOrderByCreadoEnDesc(UUID.fromString(jwt.getSubject()))
                : repository.findByPublicadaTrueOrderByCreadoEnDesc();
        return ordenes.stream().map(mapper::toDTO).toList();
    }

    // Ejecuta este método en una transacción de lectura.
    @Transactional(readOnly = true)
    public OrdenDTO obtener(UUID id, Jwt jwt) { return mapper.toDTO(buscarPublicada(id, jwt)); }

    @Transactional(readOnly = true)
    public OrdenDTO obtenerReferencia(UUID id, Jwt jwt) { return mapper.toDTO(buscarPropia(id, jwt)); }

    public OrdenDTO publicar(UUID id, Jwt jwt) {
        Orden orden = buscarPropia(id, jwt);
        if (!orden.isPublicada()) {
            long esperadas = orden.getDetalles().stream()
                    .mapToLong(detalle -> detalle.getCantidad())
                    .sum();
            if (agendamiento.contarConfirmadas(id, jwt.getTokenValue()) != esperadas)
                throw new ApiException(HttpStatus.CONFLICT, "Aún hay citas pendientes para esta orden");
            orden.setPublicada(true);
        }
        return mapper.toDTO(orden);
    }

    public OrdenDTO cambiarEstado(UUID id, EstadoOrden estado, Jwt jwt) {
        Orden orden = buscarPublicada(id, jwt);
        // Permite repetir el mismo cambio.
        if (orden.getEstado() == estado) return mapper.toDTO(orden);
        // Solo permite salir de PENDIENTE hacia un estado final.
        if (orden.getEstado() != EstadoOrden.PENDIENTE || estado == EstadoOrden.PENDIENTE)
            throw new ApiException(HttpStatus.CONFLICT, "La orden ya no admite este cambio de estado");
        // Actualiza la entidad administrada por JPA.
        orden.setEstado(estado);
        log.info("Estado de orden {} actualizado a {}", id, estado);
        return mapper.toDTO(orden);
    }

    // Verifica existencia y propiedad.
    private Orden buscarPublicada(UUID id, Jwt jwt) {
        Orden orden = buscar(id);
        // Comprueba el propietario de la orden.
        if (!orden.isPublicada() || (personal(jwt) && !esPropietario(orden, jwt)))
            // Devuelve 404 para órdenes ajenas.
            throw new ApiException(HttpStatus.NOT_FOUND, "Orden no encontrada");
        return orden;
    }

    private Orden buscarPropia(UUID id, Jwt jwt) {
        Orden orden = buscar(id);
        if (!esPropietario(orden, jwt)) throw new ApiException(HttpStatus.NOT_FOUND, "Orden no encontrada");
        return orden;
    }

    private Orden buscar(UUID id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Orden no encontrada"));
    }

    private boolean esPropietario(Orden orden, Jwt jwt) {
        return orden.getIdUsuario().toString().equals(jwt.getSubject());
    }

    // Limita el acceso según el rol.
    private boolean personal(Jwt jwt) {
        // Lee los roles del JWT validado como una lista de texto.
        List<String> roles = jwt.getClaimAsStringList("roles");
        return roles == null || (!roles.contains("ADMINISTRADOR") && !roles.contains("VENDEDOR"));
    }
}

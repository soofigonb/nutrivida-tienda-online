// DTO de la API.

// Paquete de la clase.
package cl.nutrivida.ordenes.dto;

// Importa BigDecimal.
import java.math.BigDecimal;
// Importa Instant.
import java.time.Instant;
// Importa los tipos del paquete.
import java.util.*;
// Importa EstadoOrden.
import cl.nutrivida.ordenes.model.EstadoOrden;

public record OrdenDTO(UUID id, UUID idUsuario, EstadoOrden estado, BigDecimal total,
                       // Agrega fecha y detalles a la respuesta.
                       Instant creadoEn, List<DetalleDTO> detalles) {
    // Datos del artículo comprado.
    public record DetalleDTO(Long idItem, String nombreItem, Integer cantidad, BigDecimal precioUnitario) {}
}

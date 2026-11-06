// Convierte la cabecera y sus detalles a DTO sin relaciones circulares al serializar JSON.

// Paquete de la clase.
package cl.nutrivida.ordenes.dto;

// Importa Orden.
import cl.nutrivida.ordenes.model.Orden;
// Importa Component.
import org.springframework.stereotype.Component;

// Registra esta clase auxiliar como un componente inyectable.
@Component
// Define la clase.
public class OrdenMapper {
    // Convierte la entidad a DTO.
    public OrdenDTO toDTO(Orden orden) {
        // Empieza el DTO con identificador, propietario, estado, total e instante de creación de la orden.
        return new OrdenDTO(orden.getId(), orden.getIdUsuario(), orden.getEstado(), orden.getTotal(), orden.getCreadoEn(),
            // Convierte los detalles a DTO.
            orden.getDetalles().stream().map(d -> new OrdenDTO.DetalleDTO(d.getIdPlan(), d.getNombrePlan(), d.getCantidad(), d.getPrecioUnitario())).toList());
    }
}

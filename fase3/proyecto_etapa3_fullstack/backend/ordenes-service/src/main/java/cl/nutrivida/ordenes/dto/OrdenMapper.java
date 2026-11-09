
// Paquete de la clase.
package cl.nutrivida.ordenes.dto;

// Importa Orden.
import cl.nutrivida.ordenes.model.Orden;
// Importa Component.
import org.springframework.stereotype.Component;

@Component
// Define la clase.
public class OrdenMapper {
    // Convierte la entidad a DTO.
    public OrdenDTO toDTO(Orden orden) {
        return new OrdenDTO(orden.getId(), orden.getIdUsuario(), orden.getEstado(), orden.getTotal(), orden.getCreadoEn(),
            // Convierte los detalles a DTO.
            orden.getDetalles().stream().map(d -> new OrdenDTO.DetalleDTO(d.getIdPlan(), d.getNombrePlan(), d.getCantidad(), d.getPrecioUnitario())).toList());
    }
}

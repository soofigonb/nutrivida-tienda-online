// Artículo y precio guardados en la orden.

// Paquete de la clase.
package cl.nutrivida.ordenes.model;

// Importa BigDecimal.
import java.math.BigDecimal;
// Importa UUID.
import java.util.UUID;
// Importa los tipos del paquete.
import jakarta.persistence.*;
// Importa los tipos del paquete.
import lombok.*;

// Genera el constructor de dependencias.
@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "detalle_orden", schema = "db_ordenes")
// Define la clase.
public class DetalleOrden {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_orden", nullable = false) private Orden orden;
    // Configura la columna y sus restricciones.
    @Column(name = "id_plan", nullable = false) private Long idPlan;
    // Configura la columna y sus restricciones.
    @Column(name = "nombre_plan", nullable = false, length = 150) private String nombrePlan;
    // Configura la columna y sus restricciones.
    @Column(nullable = false) private Integer cantidad;
    // Configura la columna y sus restricciones.
    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 0)
    private BigDecimal precioUnitario;
}

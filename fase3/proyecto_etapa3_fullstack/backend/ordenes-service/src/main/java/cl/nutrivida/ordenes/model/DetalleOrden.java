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
// Declara una entidad que JPA relaciona con una tabla SQL.
@Entity @Table(name = "detalle_orden", schema = "db_ordenes")
// Define la clase.
public class DetalleOrden {
    // Marca el identificador que corresponde a la clave primaria.
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    // Varios registros pueden compartir la entidad relacionada.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    // La relación usa la columna id_orden como clave foránea en la tabla de esta entidad.
    @JoinColumn(name = "id_orden", nullable = false) private Orden orden;
    // Configura la columna y sus restricciones.
    @Column(name = "id_plan", nullable = false) private Long idPlan;
    // Configura la columna y sus restricciones.
    @Column(name = "nombre_plan", nullable = false, length = 150) private String nombrePlan;
    // Configura la columna y sus restricciones.
    @Column(nullable = false) private Integer cantidad;
    // Configura la columna y sus restricciones.
    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 0)
    // Precio del plan al crear la orden, obtenido del catálogo y conservado para mantener el historial.
    private BigDecimal precioUnitario;
}

// Cabecera persistente de la orden, su propietario, total, estado y colección de detalles.

// Paquete de la clase.
package cl.nutrivida.ordenes.model;

// Importa BigDecimal.
import java.math.BigDecimal;
// Importa Instant.
import java.time.Instant;
// Importa los tipos del paquete.
import java.util.*;
// Importa los tipos del paquete.
import jakarta.persistence.*;
// Importa los tipos del paquete.
import lombok.*;

// Genera el constructor de dependencias.
@Getter @Setter @NoArgsConstructor
// Declara una entidad que JPA relaciona con una tabla SQL.
@Entity @Table(name = "orden", schema = "db_ordenes")
// Define la clase.
public class Orden {
    // Marca el identificador que corresponde a la clave primaria.
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    // Configura la columna y sus restricciones.
    @Column(name = "id_usuario", nullable = false) private UUID idUsuario;
    // Configura la columna y sus restricciones.
    @Column(name = "clave_idempotencia", nullable = false) private UUID claveIdempotencia;
    // Configura la columna y sus restricciones.
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    // Estado comercial de la orden.
    private EstadoOrden estado = EstadoOrden.PENDIENTE;
    // Configura la columna y sus restricciones.
    @Column(nullable = false, precision = 12, scale = 0) private BigDecimal total;
    // Configura la columna y sus restricciones.
    @Column(name = "creado_en", nullable = false) private Instant creadoEn;
    // Detecta cambios concurrentes.
    @Version private Long version;
    // Una cabecera tiene varios detalles: mappedBy="orden" señala el atributo dueño de la relación.
    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, orphanRemoval = true)
    // Colección de detalles de la orden.
    private List<DetalleOrden> detalles = new ArrayList<>();
    // JPA ejecuta este método antes de insertar la entidad.
    @PrePersist void crear() { creadoEn = Instant.now(); }
}

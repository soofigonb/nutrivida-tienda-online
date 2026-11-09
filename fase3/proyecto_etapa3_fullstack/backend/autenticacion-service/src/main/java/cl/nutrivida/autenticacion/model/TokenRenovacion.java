// Guarda el hash del token de renovación.

// Paquete de la clase.
package cl.nutrivida.autenticacion.model;

// Importa Instant.
import java.time.Instant;
// Importa UUID.
import java.util.UUID;

// Importa Column.
import jakarta.persistence.Column;
// Importa Entity.
import jakarta.persistence.Entity;
// Importa FetchType.
import jakarta.persistence.FetchType;
// Importa GeneratedValue.
import jakarta.persistence.GeneratedValue;
// Importa GenerationType.
import jakarta.persistence.GenerationType;
// Importa Id.
import jakarta.persistence.Id;
// Importa JoinColumn.
import jakarta.persistence.JoinColumn;
// Importa ManyToOne.
import jakarta.persistence.ManyToOne;
// Importa PrePersist.
import jakarta.persistence.PrePersist;
// Importa Table.
import jakarta.persistence.Table;
// Importa Version.
import jakarta.persistence.Version;
// Importa Getter.
import lombok.Getter;
// Importa NoArgsConstructor.
import lombok.NoArgsConstructor;
// Importa Setter.
import lombok.Setter;

// Lombok genera métodos para leer los atributos.
@Getter
@Setter
// Genera el constructor de dependencias.
@NoArgsConstructor
@Entity
@Table(name = "token_renovacion", schema = "db_autenticacion")
// Define la clase.
public class TokenRenovacion {

    @Id
    // JPA genera un UUID al persistir el registro.
    @GeneratedValue(strategy = GenerationType.UUID)
    // Identificador único de la entidad.
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    // Cuenta propietaria de este token.
    private Usuario usuario;

    // Configura la columna y sus restricciones.
    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    // Configura la columna y sus restricciones.
    @Column(name = "familia_id", nullable = false)
    private UUID familiaId;

    // Configura la columna y sus restricciones.
    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn;

    // Configura la columna y sus restricciones.
    @Column(name = "expira_en", nullable = false)
    private Instant expiraEn;

    // Configura la columna y sus restricciones.
    @Column(name = "revocado_en")
    // Instante en que se invalidó el token.
    private Instant revocadoEn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reemplazado_por")
    private TokenRenovacion reemplazadoPor;

    // Detecta cambios concurrentes.
    @Version
    // Configura la columna y sus restricciones.
    @Column(name = "version", nullable = false)
    // Control de cambios concurrentes.
    private Long version;

    // JPA ejecuta este método antes de insertar la entidad.
    @PrePersist
    protected void antesDeCrear() {
        creadoEn = Instant.now();
    }
}
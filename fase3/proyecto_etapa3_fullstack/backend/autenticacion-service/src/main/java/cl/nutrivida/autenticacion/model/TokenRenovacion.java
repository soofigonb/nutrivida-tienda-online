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
// Lombok genera métodos para asignar valores a los atributos.
@Setter
// Genera el constructor de dependencias.
@NoArgsConstructor
// Declara una entidad que JPA relaciona con una tabla SQL.
@Entity
// Relaciona la entidad con la tabla token_renovacion en el esquema SQL especificado.
@Table(name = "token_renovacion", schema = "db_autenticacion")
// Define la clase.
public class TokenRenovacion {

    // Marca el identificador que corresponde a la clave primaria.
    @Id
    // JPA genera un UUID al persistir el registro.
    @GeneratedValue(strategy = GenerationType.UUID)
    // Identificador único de la entidad.
    private UUID id;

    // Varios registros pueden compartir la entidad relacionada.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    // La relación usa la columna id_usuario como clave foránea en la tabla de esta entidad.
    @JoinColumn(name = "id_usuario", nullable = false)
    // Cuenta propietaria de este token.
    private Usuario usuario;

    // Configura la columna y sus restricciones.
    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    // SHA-256 del secreto de renovación expresado como texto hexadecimal de 64 caracteres.
    private String tokenHash;

    // Configura la columna y sus restricciones.
    @Column(name = "familia_id", nullable = false)
    // UUID que agrupa los reemplazos de una misma cadena de renovaciones.
    private UUID familiaId;

    // Configura la columna y sus restricciones.
    @Column(name = "creado_en", nullable = false, updatable = false)
    // Instante de creación de este registro, representado con java.time.Instant.
    private Instant creadoEn;

    // Configura la columna y sus restricciones.
    @Column(name = "expira_en", nullable = false)
    // Instante después del cual el token de renovación deja de aceptarse.
    private Instant expiraEn;

    // Configura la columna y sus restricciones.
    @Column(name = "revocado_en")
    // Instante en que se invalidó el token.
    private Instant revocadoEn;

    // Varios registros pueden compartir la entidad relacionada.
    @ManyToOne(fetch = FetchType.LAZY)
    // La relación usa la columna reemplazado_por como clave foránea en la tabla de esta entidad.
    @JoinColumn(name = "reemplazado_por")
    // Referencia al token que sustituyó a este registro tras una renovación.
    private TokenRenovacion reemplazadoPor;

    // Detecta cambios concurrentes.
    @Version
    // Configura la columna y sus restricciones.
    @Column(name = "version", nullable = false)
    // Control de cambios concurrentes.
    private Long version;

    // JPA ejecuta este método antes de insertar la entidad.
    @PrePersist
    // Prepara las fechas de la nueva entidad antes de que JPA la inserte.
    protected void antesDeCrear() {
        // Asigna el instante actual al campo de creación justo antes de persistir la entidad.
        creadoEn = Instant.now();
    }
}
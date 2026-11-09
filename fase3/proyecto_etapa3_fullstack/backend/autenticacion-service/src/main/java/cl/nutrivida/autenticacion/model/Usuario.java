// Entidad persistente de identidad y credenciales.

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
// Importa PreUpdate.
import jakarta.persistence.PreUpdate;
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
@Table(name = "usuario", schema = "db_autenticacion")
// Define la clase.
public class Usuario {

    @Id
    // JPA genera un UUID al persistir el registro.
    @GeneratedValue(strategy = GenerationType.UUID)
    // Identificador único de la entidad.
    private UUID id;

    // Configura la columna y sus restricciones.
    @Column(name = "correo", nullable = false, unique = true, length = 100)
    // Correo que identifica a la cuenta.
    private String correo;

    // Configura la columna y sus restricciones.
    @Column(name = "password_hash", nullable = false, length = 255)
    // Hash BCrypt persistido de la contraseña.
    private String passwordHash;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_estado_usuario", nullable = false)
    // Relación con el estado de la cuenta.
    private EstadoUsuario estadoUsuario;

    // Configura la columna y sus restricciones.
    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn;

    // Configura la columna y sus restricciones.
    @Column(name = "actualizado_en", nullable = false)
    // Instante de la última modificación de la cuenta.
    private Instant actualizadoEn;

    // Detecta cambios concurrentes.
    @Version
    // Configura la columna y sus restricciones.
    @Column(name = "version", nullable = false)
    // Control de cambios concurrentes.
    private Long version;

    // JPA ejecuta este método antes de insertar la entidad.
    @PrePersist
    protected void antesDeCrear() {
        Instant ahora = Instant.now();
        // Copia el instante capturado al campo de creación.
        creadoEn = ahora;
        actualizadoEn = ahora;
    }

    // JPA ejecuta este método antes de actualizar la entidad.
    @PreUpdate
    protected void antesDeActualizar() {
        actualizadoEn = Instant.now();
    }
}
// Entidad de referencia con los estados de cuenta.

// Paquete de la clase.
package cl.nutrivida.autenticacion.model;

// Importa Column.
import jakarta.persistence.Column;
// Importa Entity.
import jakarta.persistence.Entity;
// Importa GeneratedValue.
import jakarta.persistence.GeneratedValue;
// Importa GenerationType.
import jakarta.persistence.GenerationType;
// Importa Id.
import jakarta.persistence.Id;
// Importa Table.
import jakarta.persistence.Table;
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
@Table(name = "estado_usuario", schema = "db_autenticacion")
// Define la clase.
public class EstadoUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Identificador único de la entidad.
    private Long id;

    // Configura la columna y sus restricciones.
    @Column(name = "nombre", nullable = false, unique = true, length = 30)
    private String nombre;
}
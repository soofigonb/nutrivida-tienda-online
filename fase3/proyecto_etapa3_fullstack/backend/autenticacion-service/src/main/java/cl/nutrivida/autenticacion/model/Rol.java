// Entidad de referencia con los nombres ADMINISTRADOR, VENDEDOR y CLIENTE definidos por la migración.

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
// Lombok genera métodos para asignar valores a los atributos.
@Setter
// Genera el constructor de dependencias.
@NoArgsConstructor
// Declara una entidad que JPA relaciona con una tabla SQL.
@Entity
// Relaciona la entidad con la tabla rol en el esquema SQL especificado.
@Table(name = "rol", schema = "db_autenticacion")
// Define la clase.
public class Rol {

    // Marca el identificador que corresponde a la clave primaria.
    @Id
    // La base genera el número de la clave mediante una columna IDENTITY.
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Identificador único de la entidad.
    private Long id;

    // Configura la columna y sus restricciones.
    @Column(name = "nombre", nullable = false, unique = true, length = 30)
    // Nombre del rol o estado que se utiliza para comparar reglas de negocio y mostrar resultados.
    private String nombre;
}
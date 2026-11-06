// Repositorio Spring Data.

// Paquete de la clase.
package cl.nutrivida.autenticacion.repository;

// Importa Optional.
import java.util.Optional;
// Importa JpaRepository.
import org.springframework.data.jpa.repository.JpaRepository;
// Importa Rol.
import cl.nutrivida.autenticacion.model.Rol;

// Declara el repositorio de la entidad y el tipo de su clave.
public interface RolRepository extends JpaRepository<Rol, Long> {
    // Spring Data genera una consulta por el campo nombre.
    Optional<Rol> findByNombre(String nombre);
}

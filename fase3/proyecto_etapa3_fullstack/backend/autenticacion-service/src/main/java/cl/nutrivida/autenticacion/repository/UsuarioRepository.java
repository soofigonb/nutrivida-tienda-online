// Repositorio Spring Data.

// Paquete de la clase.
package cl.nutrivida.autenticacion.repository;

// Importa Optional.
import java.util.Optional;
// Importa UUID.
import java.util.UUID;
// Importa JpaRepository.
import org.springframework.data.jpa.repository.JpaRepository;
// Importa Usuario.
import cl.nutrivida.autenticacion.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    boolean existsByRol_Nombre(String nombre);
    // Spring Data genera una búsqueda por correo.
    Optional<Usuario> findByCorreo(String correo);
    boolean existsByCorreo(String correo);
}

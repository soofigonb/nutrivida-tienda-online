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

// Declara el repositorio de la entidad y el tipo de su clave.
public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    // Consulta si ya existe un administrador antes del alta inicial explícita.
    boolean existsByRol_Nombre(String nombre);
    // Spring Data genera una búsqueda por correo.
    Optional<Usuario> findByCorreo(String correo);
    // Spring Data genera una consulta que devuelve true si el correo ya está registrado y false si no lo está.
    boolean existsByCorreo(String correo);
}

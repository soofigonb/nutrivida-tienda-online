// Repositorio Spring Data.

// Paquete de la clase.
package cl.nutrivida.ordenes.repository;

// Importa los tipos del paquete.
import java.util.*;
// Importa Orden.
import cl.nutrivida.ordenes.model.Orden;
// Importa JpaRepository.
import org.springframework.data.jpa.repository.JpaRepository;

// Declara el repositorio de la entidad y el tipo de su clave.
public interface OrdenRepository extends JpaRepository<Orden, UUID> {
    // Consulta las órdenes del propietario.
    List<Orden> findByIdUsuarioOrderByCreadoEnDesc(UUID idUsuario);
    // Spring Data busca por usuario y clave de idempotencia a la vez.
    Optional<Orden> findByIdUsuarioAndClaveIdempotencia(UUID idUsuario, UUID claveIdempotencia);
}

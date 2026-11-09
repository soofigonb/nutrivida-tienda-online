// Repositorio Spring Data.

// Paquete de la clase.
package cl.nutrivida.ordenes.repository;

// Importa los tipos del paquete.
import java.util.*;
// Importa Orden.
import cl.nutrivida.ordenes.model.Orden;
// Importa JpaRepository.
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrdenRepository extends JpaRepository<Orden, UUID> {
    // Consulta las órdenes del propietario.
    List<Orden> findByIdUsuarioOrderByCreadoEnDesc(UUID idUsuario);
    Optional<Orden> findByIdUsuarioAndClaveIdempotencia(UUID idUsuario, UUID claveIdempotencia);
}

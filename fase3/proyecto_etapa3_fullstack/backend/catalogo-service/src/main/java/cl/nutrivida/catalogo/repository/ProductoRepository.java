package cl.nutrivida.catalogo.repository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import cl.nutrivida.catalogo.model.Producto;

public interface ProductoRepository extends JpaRepository<Producto, UUID> {

    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, UUID id);
    List<Producto> findByActivoTrue();
    Optional<Producto> findByIdAndActivoTrue(UUID id);
    Optional<Producto> findByIdVentaAndActivoTrue(Long idVenta);
}

package cl.nutrivida.catalogo.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import cl.nutrivida.catalogo.model.Producto;

public interface ProductoRepository extends JpaRepository<Producto, UUID> {

    boolean existsByNombreIgnoreCase(String nombre);
}
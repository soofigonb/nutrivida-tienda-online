package cl.nutrivida.catalogo.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import cl.nutrivida.catalogo.model.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {
    boolean existsByNombreIgnoreCase(String nombre);
}

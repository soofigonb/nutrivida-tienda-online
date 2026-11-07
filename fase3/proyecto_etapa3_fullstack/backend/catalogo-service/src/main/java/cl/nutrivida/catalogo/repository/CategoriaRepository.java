package cl.nutrivida.catalogo.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.nutrivida.catalogo.model.Categoria;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {
}
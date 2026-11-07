package cl.nutrivida.catalogo.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.nutrivida.catalogo.model.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, UUID> {
}
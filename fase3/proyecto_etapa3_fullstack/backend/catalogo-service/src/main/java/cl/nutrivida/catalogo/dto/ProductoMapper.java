package cl.nutrivida.catalogo.dto;

import org.springframework.stereotype.Component;
import cl.nutrivida.catalogo.model.Categoria;
import cl.nutrivida.catalogo.model.Producto;

@Component
public class ProductoMapper {

    public ProductoDTO toDTO(Producto producto) {
        return new ProductoDTO(
            producto.getId(),
            producto.getNombre(),
            producto.getDescripcion(),
            producto.getPrecio(),
            producto.getStock(),
            producto.getImagenUrl(),
            producto.getCategoria().getNombre(),
            producto.getCategoria().getId(),
            producto.getActivo()
        );
    }

    public CategoriaDTO toDTO(Categoria categoria) {
        return new CategoriaDTO(
            categoria.getId(),
            categoria.getNombre(),
            categoria.getDescripcion(),
            categoria.getActivo()
        );
    }

}

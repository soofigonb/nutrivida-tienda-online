package cl.nutrivida.catalogo.service;

import cl.nutrivida.catalogo.dto.CategoriaDTO;
import cl.nutrivida.catalogo.dto.CrearProductoDTO;
import cl.nutrivida.catalogo.dto.ProductoMapper;
import cl.nutrivida.catalogo.model.Producto;
import cl.nutrivida.catalogo.repository.CategoriaRepository;
import cl.nutrivida.catalogo.repository.ProductoRepository;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProductoDuplicadosTest {
    @Test
    void evitaNombresDuplicadosEnCategoriasYProductos() {
        var productos = mock(ProductoRepository.class);
        var categorias = mock(CategoriaRepository.class);
        var servicio = new ProductoService(productos, categorias, new ProductoMapper(), 0);
        when(categorias.existsByNombreIgnoreCase("Planes")).thenReturn(true);
        assertThrows(IllegalArgumentException.class,
                () -> servicio.crearCategoria(new CategoriaDTO(null, "Planes", "Planes", true)));
        var datos = new CrearProductoDTO("Consulta", "Consulta", BigDecimal.TEN, 1, null, UUID.randomUUID());
        when(productos.existsByNombreIgnoreCase("Consulta")).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> servicio.crear(datos));
        var id = UUID.randomUUID();
        when(productos.findByIdAndActivoTrue(id)).thenReturn(Optional.of(new Producto()));
        when(productos.existsByNombreIgnoreCaseAndIdNot("Consulta", id)).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> servicio.actualizar(id, datos));
        verify(productos, never()).save(any());
        verify(categorias, never()).save(any());
    }
}

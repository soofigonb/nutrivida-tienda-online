package cl.nutrivida.catalogo.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import cl.nutrivida.catalogo.dto.CrearProductoDTO;
import cl.nutrivida.catalogo.dto.ProductoDTO;
import cl.nutrivida.catalogo.exceptions.RecursoNoEncontradoException;
import cl.nutrivida.catalogo.dto.CategoriaDTO;
import cl.nutrivida.catalogo.mapper.ProductoMapper;
import cl.nutrivida.catalogo.model.Categoria;
import cl.nutrivida.catalogo.model.Producto;
import cl.nutrivida.catalogo.repository.CategoriaRepository;
import cl.nutrivida.catalogo.repository.ProductoRepository;
import java.util.List;
import java.util.UUID;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoMapper mapper;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository, ProductoMapper mapper) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<ProductoDTO> listar() {
        return productoRepository.findAll().stream().map(mapper::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public ProductoDTO buscarPorId(UUID id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto con ID " + id + " no encontrado"));
        return mapper.toDTO(producto);
    }

    @Transactional(readOnly = true)
    public List<CategoriaDTO> listarCategorias() {
        return categoriaRepository.findAll().stream().map(mapper::toDTO).toList();
    }

    @Transactional
    public ProductoDTO crear(CrearProductoDTO datos) {
        // 1. Validación de Negocio: Evitar crear productos con nombres duplicados (Opcional según tu lógica)
        if (productoRepository.existsByNombreIgnoreCase(datos.nombre())) {
            throw new IllegalArgumentException("Ya existe un producto registrado con el nombre: " + datos.nombre());
        }

        // 2. Validación de Negocio: Verificar existencia de la categoría relacional
        Categoria categoria = categoriaRepository.findById(datos.idCategoria())
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada con ID: " + datos.idCategoria()));

        Producto producto = new Producto();
        producto.setNombre(datos.nombre());
        producto.setDescripcion(datos.descripcion());
        producto.setPrecio(datos.precio());
        producto.setStock(datos.stock());
        producto.setImagenUrl(datos.imagenUrl());
        producto.setCategoria(categoria);
        producto.setActivo(true);

        return mapper.toDTO(productoRepository.save(producto));
    }
}
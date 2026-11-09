package cl.nutrivida.catalogo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import cl.nutrivida.catalogo.dto.CrearProductoDTO;
import cl.nutrivida.catalogo.dto.ProductoDTO;
import cl.nutrivida.catalogo.dto.PlanVentaDTO;
import cl.nutrivida.catalogo.exceptions.RecursoNoEncontradoException;
import cl.nutrivida.catalogo.dto.CategoriaDTO;
import cl.nutrivida.catalogo.dto.ProductoMapper;
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
    private final int precioDecimales;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository,
            ProductoMapper mapper, @Value("${catalogo.precio-decimales:2}") int precioDecimales) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.mapper = mapper;
        this.precioDecimales = precioDecimales;
    }

    @Transactional(readOnly = true)
    public List<ProductoDTO> listar() {
        return productoRepository.findByActivoTrue().stream().map(mapper::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public ProductoDTO buscarPorId(UUID id) {
        return mapper.toDTO(buscarActivo(id));
    }

    @Transactional(readOnly = true)
    public List<CategoriaDTO> listarCategorias() {
        return categoriaRepository.findAll().stream().map(mapper::toDTO).toList();
    }

    @Transactional
    public CategoriaDTO crearCategoria(CategoriaDTO datos) {
        String nombre = datos.nombre().strip();
        if (categoriaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new IllegalArgumentException("Ya existe una categoría con el nombre: " + nombre);
        }
        Categoria categoria = new Categoria();
        categoria.setNombre(nombre);
        categoria.setDescripcion(datos.descripcion());
        categoria.setActivo(datos.activo());
        return mapper.toDTO(categoriaRepository.save(categoria));
    }

    @Transactional(readOnly = true)
    public List<PlanVentaDTO> listarPlanes() {
        return productoRepository.findByActivoTrue().stream().map(this::aPlan).toList();
    }

    @Transactional(readOnly = true)
    public PlanVentaDTO buscarPlan(Long id) {
        return productoRepository.findByIdVentaAndActivoTrue(id).map(this::aPlan)
                .orElseThrow(() -> new RecursoNoEncontradoException("Artículo no disponible"));
    }

    @Transactional
    public ProductoDTO crear(CrearProductoDTO datos) {
        if (productoRepository.existsByNombreIgnoreCase(datos.nombre())) {
            throw new IllegalArgumentException("Ya existe un producto registrado con el nombre: " + datos.nombre());
        }

        Producto producto = new Producto();
        producto.setActivo(true);
        aplicarDatos(producto, datos);
        return mapper.toDTO(productoRepository.save(producto));
    }

    @Transactional
    public ProductoDTO actualizar(UUID id, CrearProductoDTO datos) {
        Producto producto = buscarActivo(id);
        if (productoRepository.existsByNombreIgnoreCaseAndIdNot(datos.nombre(), id)) {
            throw new IllegalArgumentException("Ya existe un producto registrado con el nombre: " + datos.nombre());
        }
        aplicarDatos(producto, datos);
        return mapper.toDTO(producto);
    }

    @Transactional
    public void darDeBaja(UUID id) {
        buscarActivo(id).setActivo(false);
    }

    private Producto buscarActivo(UUID id) {
        return productoRepository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto con ID " + id + " no encontrado"));
    }

    private PlanVentaDTO aPlan(Producto producto) {
        return new PlanVentaDTO(producto.getIdVenta(), producto.getCodigo(), producto.getNombre(),
                producto.getDescripcion(), producto.getPrecio(), producto.getCategoria().getNombre(),
                producto.getImagenUrl(), producto.getStock() > 0);
    }

    private void aplicarDatos(Producto producto, CrearProductoDTO datos) {
        if (datos.precio().stripTrailingZeros().scale() > precioDecimales) {
            throw new IllegalArgumentException("El precio supera la precisión configurada");
        }
        Categoria categoria = categoriaRepository.findById(datos.idCategoria())
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada con ID: " + datos.idCategoria()));

        producto.setNombre(datos.nombre());
        producto.setDescripcion(datos.descripcion());
        producto.setPrecio(datos.precio());
        producto.setStock(datos.stock());
        producto.setImagenUrl(datos.imagenUrl());
        producto.setCategoria(categoria);
    }
}

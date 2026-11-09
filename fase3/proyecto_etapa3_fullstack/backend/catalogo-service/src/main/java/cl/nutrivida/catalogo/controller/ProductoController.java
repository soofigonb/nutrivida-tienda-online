package cl.nutrivida.catalogo.controller;

import cl.nutrivida.catalogo.dto.CategoriaDTO;
import cl.nutrivida.catalogo.dto.CrearProductoDTO;
import cl.nutrivida.catalogo.dto.ProductoDTO;
import cl.nutrivida.catalogo.dto.PlanVentaDTO;
import cl.nutrivida.catalogo.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/catalogo", "/api/productos"})
@Tag(name = "Productos", description = "Endpoints para la gestión del catálogo de productos")
public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar todos los productos", description = "Retorna el catálogo completo de productos activos")
    public List<ProductoDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto por ID", description = "Retorna los detalles de un producto específico dado su UUID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Producto encontrado"),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    public ProductoDTO buscarPorId(@PathVariable UUID id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/categorias")
    @Operation(summary = "Listar categorías", description = "Retorna el listado de categorías disponibles")
    public List<CategoriaDTO> listarCategorias() {
        return service.listarCategorias();
    }

    @PostMapping("/categorias")
    @SecurityRequirement(name = "bearerAuth")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear una categoría")
    @ApiResponse(responseCode = "201", description = "Categoría creada")
    public CategoriaDTO crearCategoria(@Valid @RequestBody CategoriaDTO datos) {
        return service.crearCategoria(datos);
    }

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Crear nuevo producto", description = "Crea un producto en el catálogo validando sus atributos obligatorios")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Producto creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos o faltantes")
    })
    public ResponseEntity<ProductoDTO> crear(@Valid @RequestBody CrearProductoDTO datos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(datos));
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Actualizar producto")
    public ProductoDTO actualizar(@PathVariable UUID id, @Valid @RequestBody CrearProductoDTO datos) {
        return service.actualizar(id, datos);
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Dar de baja un producto")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void darDeBaja(@PathVariable UUID id) {
        service.darDeBaja(id);
    }

    @GetMapping("/planes")
    @Operation(summary = "Listar artículos con su identificador de venta")
    public List<PlanVentaDTO> listarPlanes() {
        return service.listarPlanes();
    }

    @GetMapping("/planes/{id}")
    @Operation(summary = "Consultar un artículo por su identificador de venta")
    public PlanVentaDTO buscarPlan(@PathVariable Long id) {
        return service.buscarPlan(id);
    }
}

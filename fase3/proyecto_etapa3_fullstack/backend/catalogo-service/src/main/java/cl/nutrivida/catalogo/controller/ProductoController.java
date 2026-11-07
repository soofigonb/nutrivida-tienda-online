package cl.nutrivida.catalogo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import cl.nutrivida.catalogo.dto.CrearProductoDTO;
import cl.nutrivida.catalogo.dto.ProductoDTO;
import cl.nutrivida.catalogo.dto.CategoriaDTO;
import cl.nutrivida.catalogo.service.ProductoService;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")

public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProductoDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ProductoDTO buscarPorId(@PathVariable UUID id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/categorias")
    public List<CategoriaDTO> listarCategorias() {
        return service.listarCategorias();
    }

    @PostMapping
    public ResponseEntity<ProductoDTO> crear(@RequestBody CrearProductoDTO datos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(datos));
    }
}
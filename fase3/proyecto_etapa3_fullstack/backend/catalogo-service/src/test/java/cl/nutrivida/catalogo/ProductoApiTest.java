package cl.nutrivida.catalogo;

import cl.nutrivida.catalogo.controller.ProductoController;
import cl.nutrivida.catalogo.dto.ProductoMapper;
import cl.nutrivida.catalogo.exceptions.GlobalExceptionHandler;
import cl.nutrivida.catalogo.model.Categoria;
import cl.nutrivida.catalogo.model.Producto;
import cl.nutrivida.catalogo.repository.CategoriaRepository;
import cl.nutrivida.catalogo.repository.ProductoRepository;
import cl.nutrivida.catalogo.service.ProductoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ProductoApiTest {
    private static final String RUTA = "/api/v1/catalogo";
    private static final UUID ID = UUID.randomUUID();
    private static final UUID CATEGORIA = UUID.randomUUID();
    private final ProductoRepository productos = mock(ProductoRepository.class);
    private final CategoriaRepository categorias = mock(CategoriaRepository.class);
    private final Categoria categoria = new Categoria();
    private final Producto producto = new Producto();
    private MockMvc api;

    @BeforeEach
    void preparar() {
        categoria.setId(CATEGORIA);
        categoria.setNombre("Accesorios");
        categoria.setActivo(true);
        producto.setId(ID);
        producto.setIdVenta(1000000000L);
        producto.setNombre("Artículo");
        producto.setPrecio(BigDecimal.TEN);
        producto.setStock(2);
        producto.setActivo(true);
        producto.setCategoria(categoria);
        when(productos.findByActivoTrue()).thenReturn(List.of(producto));
        when(productos.findByIdAndActivoTrue(ID)).thenReturn(Optional.of(producto));
        when(productos.findByIdVentaAndActivoTrue(1000000000L)).thenReturn(Optional.of(producto));
        when(categorias.findAll()).thenReturn(List.of(categoria));
        when(categorias.findById(CATEGORIA)).thenReturn(Optional.of(categoria));
        when(productos.save(any(Producto.class))).thenAnswer(invocacion -> {
            Producto nuevo = invocacion.getArgument(0);
            nuevo.setId(ID);
            return nuevo;
        });
        when(categorias.save(any(Categoria.class))).thenAnswer(invocacion -> invocacion.getArgument(0));
        api = crearApi(2);
    }

    @Test
    void consultaProductoPorUuidYPorIdentificadorDeVenta() throws Exception {
        api.perform(get(RUTA)).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(ID.toString()));
        api.perform(get(RUTA + "/" + ID)).andExpect(status().isOk()).andExpect(jsonPath("$.idCategoria").value(CATEGORIA.toString()));
        api.perform(get(RUTA + "/planes")).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(1000000000));
        producto.setStock(0);
        api.perform(get(RUTA + "/planes/1000000000")).andExpect(status().isOk()).andExpect(jsonPath("$.activo").value(false));
        api.perform(get(RUTA + "/planes/1")).andExpect(status().isNotFound());
    }

    @Test
    void creaCategoriaYProductoSinDatosNutriVida() throws Exception {
        api.perform(get(RUTA + "/categorias")).andExpect(status().isOk());
        api.perform(post(RUTA + "/categorias").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nombre":"Equipos","activo":true}
                        """)).andExpect(status().isCreated()).andExpect(jsonPath("$.nombre").value("Equipos"));
        api.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(productoJson("12.50")))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.precio").value(12.5));
    }

    @Test
    void actualizaYDadaDeBajaConservaElRegistro() throws Exception {
        api.perform(put(RUTA + "/" + ID).contentType(MediaType.APPLICATION_JSON).content(productoJson("20")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.precio").value(20));
        api.perform(delete(RUTA + "/" + ID)).andExpect(status().isNoContent());
        assertFalse(producto.getActivo());
        api.perform(get(RUTA + "/" + UUID.randomUUID())).andExpect(status().isNotFound());
    }

    @Test
    void rechazaPreciosInvalidosYAplicaPrecisionDelPerfil() throws Exception {
        api.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(productoJson("-1")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.precio").exists());
        crearApi(0).perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(productoJson("12.50")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").exists());
    }

    private MockMvc crearApi(int decimales) {
        var servicio = new ProductoService(productos, categorias, new ProductoMapper(), decimales);
        return MockMvcBuilders.standaloneSetup(new ProductoController(servicio))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    private String productoJson(String precio) {
        return """
                {"nombre":"Equipo de prueba","precio":%s,"stock":2,"idCategoria":"%s"}
                """.formatted(precio, CATEGORIA);
    }
}

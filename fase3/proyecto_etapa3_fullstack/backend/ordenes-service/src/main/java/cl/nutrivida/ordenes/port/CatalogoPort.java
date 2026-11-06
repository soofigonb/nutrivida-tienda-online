// Contrato del catálogo que necesita el negocio de órdenes, independiente de NutriVida.
package cl.nutrivida.ordenes.port;

// Los precios se representan con decimales exactos.
import java.math.BigDecimal;

// Un adaptador implementa cómo consultar cada catálogo externo.
public interface CatalogoPort {
    // Describe únicamente los datos comerciales necesarios para cotizar un artículo.
    record ProductoDTO(Long id, String nombre, BigDecimal precio, Boolean activo) {}

    // La orden solicita el artículo usando la identidad del usuario autenticado.
    ProductoDTO consultar(Long idItem, String tokenAcceso);
}

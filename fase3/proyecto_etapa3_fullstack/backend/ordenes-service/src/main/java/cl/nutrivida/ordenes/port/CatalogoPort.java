package cl.nutrivida.ordenes.port;

// Los precios se representan con decimales exactos.
import java.math.BigDecimal;

public interface CatalogoPort {
    record ProductoDTO(Long id, String nombre, BigDecimal precio, Boolean activo) {}

    ProductoDTO consultar(Long idItem, String tokenAcceso);
}

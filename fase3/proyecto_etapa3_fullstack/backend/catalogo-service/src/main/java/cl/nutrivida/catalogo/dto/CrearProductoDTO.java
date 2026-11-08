package cl.nutrivida.catalogo.dto;

import java.util.UUID;
import java.math.BigDecimal;

public record CrearProductoDTO(
    String nombre,
    String descripcion,
    BigDecimal precio,
    Integer stock,
    String imagenUrl,
    UUID idCategoria
) {
    
}

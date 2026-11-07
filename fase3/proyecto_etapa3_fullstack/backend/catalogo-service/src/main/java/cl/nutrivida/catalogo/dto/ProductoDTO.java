package cl.nutrivida.catalogo.dto;

import java.util.UUID;
import java.math.BigDecimal;

public record ProductoDTO(
    UUID id,
    String nombre,
    String descripcion,
    BigDecimal precio,
    Integer stock,
    String imagenUrl,
    String categoria,
    Boolean activo
) {
    
}

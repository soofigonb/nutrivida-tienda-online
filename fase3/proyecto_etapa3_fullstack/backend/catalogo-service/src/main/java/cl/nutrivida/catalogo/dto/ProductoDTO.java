package cl.nutrivida.catalogo.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record ProductoDTO(
    @NotNull UUID id,
    @NotNull String nombre,
    String descripcion,
    @NotNull BigDecimal precio,
    @NotNull Integer stock,
    String imagenUrl,
    String categoria,
    @NotNull Boolean activo
) {
}
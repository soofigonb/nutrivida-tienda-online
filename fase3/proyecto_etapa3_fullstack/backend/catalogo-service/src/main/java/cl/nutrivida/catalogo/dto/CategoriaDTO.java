package cl.nutrivida.catalogo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record CategoriaDTO (
    UUID id,

    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    String nombre,

    @Size(max = 255, message = "La descripción no puede exceder los 255 caracteres")
    String descripcion,

    @NotNull(message = "El estado activo es obligatorio")
    Boolean activo
) {
}
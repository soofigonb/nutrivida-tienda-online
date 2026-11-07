package cl.nutrivida.catalogo.dto;

import java.util.UUID;

public record CategoriaDTO (
    UUID id,
    String nombre,
    String descripcion,
    Boolean activo
) {
    
}

package cl.nutrivida.catalogo.dto;

import java.math.BigDecimal;

public record PlanVentaDTO(Long id, String codigo, String nombre, String descripcion,
                          BigDecimal precio, String categoria, String imagenUrl, boolean activo) {}

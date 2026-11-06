// DTO de la API.

// Paquete de la clase.
package cl.nutrivida.autenticacion.dto;

// Importa los tipos del paquete.
import jakarta.validation.constraints.*;

// DTO de renovación: refreshToken es obligatorio y se limita a 256 caracteres.
public record RenovacionDTO(@NotBlank @Size(max = 256) String refreshToken) {}

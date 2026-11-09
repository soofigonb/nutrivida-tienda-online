// DTO de la API.

// Paquete de la clase.
package cl.nutrivida.autenticacion.dto;

// Importa los tipos del paquete.
import jakarta.validation.constraints.*;

public record RenovacionDTO(@NotBlank @Size(max = 256) String refreshToken) {}

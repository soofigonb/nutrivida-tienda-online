// DTO de la API.

// Paquete de la clase.
package cl.nutrivida.autenticacion.dto;

// Importa los tipos del paquete.
import jakarta.validation.constraints.*;

public record RegistroDTO(
    @NotBlank @Email @Size(max = 100) String correo,
    @NotBlank @Size(min = 6, max = 72) String password) {}

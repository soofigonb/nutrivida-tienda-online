// DTO de la API.

// Paquete de la clase.
package cl.nutrivida.autenticacion.dto;

// Importa los tipos del paquete.
import jakarta.validation.constraints.*;

public record LoginDTO(@NotBlank @Email @Size(max = 100) String correo,
                       @NotBlank @Size(max = 72) String password) {}

// DTO de la API.

// Paquete de la clase.
package cl.nutrivida.autenticacion.dto;

// Importa los tipos del paquete.
import jakarta.validation.constraints.*;

// DTO de entrada para login: el record genera constructor y accesores correo() y password().
public record LoginDTO(@NotBlank @Email @Size(max = 100) String correo,
                       // Valida la contraseña como texto obligatorio y aplica los límites de @Size.
                       @NotBlank @Size(max = 72) String password) {}

// DTO de la API.

// Paquete de la clase.
package cl.nutrivida.autenticacion.dto;

// Importa los tipos del paquete.
import jakarta.validation.constraints.*;

// El registro público no acepta rol ni estado: siempre crea un cliente activo.
// DTO de registro: un record con constructor y accesores generados por Java.
public record RegistroDTO(
    // Valida el correo: @NotBlank exige texto, @Email comprueba el formato y @Size(max=100) limita la longitud.
    @NotBlank @Email @Size(max = 100) String correo,
    // Valida la contraseña como texto obligatorio y aplica los límites de @Size.
    @NotBlank @Size(min = 6, max = 72) String password) {}

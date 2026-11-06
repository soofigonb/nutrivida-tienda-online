// DTO de la API.

// Paquete de la clase.
package cl.nutrivida.autenticacion.dto;

// Importa UUID.
import java.util.UUID;

// Respuesta pública de usuario con UUID, correo, nombre de rol y estado.
public record UsuarioDTO(UUID id, String correo, String rol, String estado) {}

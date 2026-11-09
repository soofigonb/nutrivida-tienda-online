// DTO de la API.

// Paquete de la clase.
package cl.nutrivida.autenticacion.dto;

// Importa UUID.
import java.util.UUID;

public record UsuarioDTO(UUID id, String correo, String rol, String estado) {}

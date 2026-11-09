// DTO de la API.

// Paquete de la clase.
package cl.nutrivida.autenticacion.dto;

// Tokens y datos de la sesión.
public record SesionDTO(String accessToken, String refreshToken, String tokenType,
                        long expiresIn, UsuarioDTO usuario) {}

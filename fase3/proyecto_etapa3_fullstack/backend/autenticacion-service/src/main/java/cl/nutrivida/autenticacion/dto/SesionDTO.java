// DTO de la API.

// Paquete de la clase.
package cl.nutrivida.autenticacion.dto;

// Tokens y datos de la sesión.
public record SesionDTO(String accessToken, String refreshToken, String tokenType,
                        // Completa el record con la vigencia del JWT expresada en segundos y el DTO público de la cuenta.
                        long expiresIn, UsuarioDTO usuario) {}

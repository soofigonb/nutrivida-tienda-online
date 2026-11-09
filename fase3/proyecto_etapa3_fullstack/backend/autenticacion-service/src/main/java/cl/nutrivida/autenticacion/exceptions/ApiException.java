// Error de negocio con mensaje y estado HTTP.

// Paquete de la clase.
package cl.nutrivida.autenticacion.exceptions;

// Importa HttpStatus.
import org.springframework.http.HttpStatus;

// Define la clase.
public class ApiException extends RuntimeException {
    // Estado HTTP del error.
    private final HttpStatus status;
    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
    public HttpStatus getStatus() { return status; }
}

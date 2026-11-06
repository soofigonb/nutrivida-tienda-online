// Error de negocio con mensaje y estado HTTP.

// Paquete de la clase.
package cl.nutrivida.ordenes.exceptions;

// Importa HttpStatus.
import org.springframework.http.HttpStatus;

// Define la clase.
public class ApiException extends RuntimeException {
    // Estado HTTP del error.
    private final HttpStatus status;
    // Constructor del error: recibe un estado HTTP y un mensaje y los conserva en la excepción.
    public ApiException(HttpStatus status, String message) { super(message); this.status = status; }
    // Devuelve el estado HTTP guardado en la excepción para construir la respuesta de error.
    public HttpStatus getStatus() { return status; }
}

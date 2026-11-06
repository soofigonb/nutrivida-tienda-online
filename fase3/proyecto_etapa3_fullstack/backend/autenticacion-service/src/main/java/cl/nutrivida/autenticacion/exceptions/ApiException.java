// Error de negocio con mensaje y estado HTTP.

// Paquete de la clase.
package cl.nutrivida.autenticacion.exceptions;

// Importa HttpStatus.
import org.springframework.http.HttpStatus;

// Define la clase.
public class ApiException extends RuntimeException {
    // Estado HTTP del error.
    private final HttpStatus status;
    // Constructor del error: recibe un estado HTTP y un mensaje y los conserva en la excepción.
    public ApiException(HttpStatus status, String message) {
        // Entrega el mensaje al constructor de RuntimeException para que la excepción lo conserve.
        super(message);
        // Guarda el estado HTTP que debe utilizar el manejador de errores.
        this.status = status;
    }
    // Devuelve el estado HTTP guardado en la excepción para construir la respuesta de error.
    public HttpStatus getStatus() { return status; }
}

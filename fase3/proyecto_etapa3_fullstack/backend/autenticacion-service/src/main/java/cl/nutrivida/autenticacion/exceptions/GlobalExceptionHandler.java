// Traduce excepciones conocidas a respuestas HTTP comprensibles sin exponer detalles SQL ni secretos.

// Paquete de la clase.
package cl.nutrivida.autenticacion.exceptions;

// Importa Map.
import java.util.Map;
// Importa los tipos del paquete.
import org.springframework.http.*;
// Importa DataIntegrityViolationException.
import org.springframework.dao.DataIntegrityViolationException;
// Importa MethodArgumentNotValidException.
import org.springframework.web.bind.MethodArgumentNotValidException;
// Importa los tipos del paquete.
import org.springframework.web.bind.annotation.*;

// Centraliza el tratamiento de excepciones de los controladores y produce respuestas HTTP de error.
@RestControllerAdvice
// Define la clase.
public class GlobalExceptionHandler {
    // Maneja la excepción indicada.
    @ExceptionHandler(ApiException.class)
    // Transforma un error de negocio en una respuesta HTTP con su estado y mensaje.
    ResponseEntity<ProblemDetail> negocio(ApiException e) {
        // Construye la respuesta con el estado y mensaje del error de negocio en formato ProblemDetail.
        return ResponseEntity.status(e.getStatus()).body(ProblemDetail.forStatusAndDetail(e.getStatus(), e.getMessage()));
    }
    // Maneja la excepción indicada.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    // Transforma datos de entrada inválidos en una respuesta HTTP 400.
    ResponseEntity<ProblemDetail> validacion(MethodArgumentNotValidException e) {
        // Crea un error estructurado 400 para una solicitud que no pasó las validaciones del DTO.
        ProblemDetail p = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Revise los datos ingresados");
        // Lee los errores de campos y prepara una propiedad adicional llamada errores en la respuesta.
        p.setProperty("errores", e.getBindingResult().getFieldErrors().stream()
            // Convierte cada error a campo y mensaje.
            .map(f -> Map.of("campo", f.getField(), "mensaje", String.valueOf(f.getDefaultMessage()))).toList());
        // Envía HTTP 400 con el detalle de validación ya preparado.
        return ResponseEntity.badRequest().body(p);
    }
    // Maneja la excepción indicada.
    @ExceptionHandler(DataIntegrityViolationException.class)
    // Transforma un conflicto de persistencia o de concurrencia en HTTP 409.
    ResponseEntity<ProblemDetail> conflicto() {
        // Devuelve HTTP 409 Conflict con un mensaje controlado.
        return ResponseEntity.status(409).body(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "El registro ya existe o tiene relaciones vigentes"));
    }
}

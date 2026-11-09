
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

@RestControllerAdvice
// Define la clase.
public class GlobalExceptionHandler {
    // Maneja la excepción indicada.
    @ExceptionHandler(ApiException.class)
    ResponseEntity<ProblemDetail> negocio(ApiException e) {
        return ResponseEntity.status(e.getStatus()).body(ProblemDetail.forStatusAndDetail(e.getStatus(), e.getMessage()));
    }
    // Maneja la excepción indicada.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ProblemDetail> validacion(MethodArgumentNotValidException e) {
        ProblemDetail p = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Revise los datos ingresados");
        p.setProperty("errores", e.getBindingResult().getFieldErrors().stream()
            // Convierte cada error a campo y mensaje.
            .map(f -> Map.of("campo", f.getField(), "mensaje", String.valueOf(f.getDefaultMessage()))).toList());
        return ResponseEntity.badRequest().body(p);
    }
    // Maneja la excepción indicada.
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ProblemDetail> conflicto() {
        // Devuelve HTTP 409 Conflict con un mensaje controlado.
        return ResponseEntity.status(409).body(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "El registro ya existe o tiene relaciones vigentes"));
    }
}

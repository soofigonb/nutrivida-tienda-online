
// Paquete de la clase.
package cl.nutrivida.ordenes.exceptions;

// Importa los tipos del paquete.
import org.springframework.http.*;
// Importa los tipos del paquete.
import org.springframework.dao.*;
// Importa MethodArgumentNotValidException.
import org.springframework.web.bind.MethodArgumentNotValidException;
// Importa los tipos del paquete.
import org.springframework.web.bind.annotation.*;
// Importa FeignException.
import feign.FeignException;

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
    ResponseEntity<ProblemDetail> validacion() {
        return ResponseEntity.badRequest().body(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Revise los datos de la orden"));
    }
    // Maneja la excepción indicada.
    @ExceptionHandler({DataIntegrityViolationException.class, OptimisticLockingFailureException.class})
    ResponseEntity<ProblemDetail> conflicto() {
        // Devuelve HTTP 409 Conflict con un mensaje controlado.
        return ResponseEntity.status(409).body(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "La orden cambió o la solicitud ya existe; consulte su estado antes de reintentar"));
    }
    // Maneja la excepción indicada.
    @ExceptionHandler(FeignException.class)
    ResponseEntity<ProblemDetail> dependencia() {
        return ResponseEntity.status(503).body(ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo validar el catálogo; no se creó la orden"));
    }
}

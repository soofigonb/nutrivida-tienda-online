// Traduce excepciones conocidas a respuestas HTTP comprensibles sin exponer detalles SQL ni secretos.

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
    ResponseEntity<ProblemDetail> validacion() {
        // Devuelve HTTP 400 Bad Request con un mensaje sobre los datos inválidos de la solicitud.
        return ResponseEntity.badRequest().body(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Revise los datos de la orden"));
    }
    // Maneja la excepción indicada.
    @ExceptionHandler({DataIntegrityViolationException.class, OptimisticLockingFailureException.class})
    // Transforma un conflicto de persistencia o de concurrencia en HTTP 409.
    ResponseEntity<ProblemDetail> conflicto() {
        // Devuelve HTTP 409 Conflict con un mensaje controlado.
        return ResponseEntity.status(409).body(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "La orden cambió o la solicitud ya existe; consulte su estado antes de reintentar"));
    }
    // Maneja la excepción indicada.
    @ExceptionHandler(FeignException.class)
    // Responde 503 cuando no se pudo consultar correctamente el catálogo, sin inventar sus datos.
    ResponseEntity<ProblemDetail> dependencia() {
        // Devuelve HTTP 503 Service Unavailable indicando que el catálogo no pudo validarse.
        return ResponseEntity.status(503).body(ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo validar el catálogo; no se creó la orden"));
    }
}

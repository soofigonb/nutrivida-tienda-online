// Pruebas del componente.

// Paquete de la clase.
package cl.nutrivida.ordenes;

// Importa Test.
import org.junit.jupiter.api.Test;
// Importa Validation.
import jakarta.validation.Validation;
// Importa CrearOrdenDTO.
import cl.nutrivida.ordenes.dto.CrearOrdenDTO;
// Importa los tipos del paquete.
import java.util.*;
// Importa los tipos del paquete.
import static org.junit.jupiter.api.Assertions.*;

// Define la clase.
class OrdenesServiceApplicationTests {

	// Caso de prueba.
	@Test
	// Define el caso o la preparación validaCantidadYClaveDeLaSolicitud.
	void validaCantidadYClaveDeLaSolicitud() {
        // Cierra el validador al terminar.
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            // Obtiene el validador que ejecutará las restricciones anotadas en los DTO de entrada.
            var validator = factory.getValidator();
            // Verifica la condición.
            assertFalse(validator.validate(new CrearOrdenDTO(null, List.of(new CrearOrdenDTO.ItemDTO(1L, 0)))).isEmpty());
            // Verifica la condición.
            assertTrue(validator.validate(new CrearOrdenDTO(UUID.randomUUID(), List.of(new CrearOrdenDTO.ItemDTO(1L, 1)))).isEmpty());
        }
	}

}

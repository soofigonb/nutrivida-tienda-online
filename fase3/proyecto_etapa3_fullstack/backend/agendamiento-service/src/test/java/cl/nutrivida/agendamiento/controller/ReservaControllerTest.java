// Pruebas del componente.

// Paquete de la clase.
package cl.nutrivida.agendamiento.controller;

// Importa los tipos del paquete.
import java.util.List;
import java.util.Map;
// Importa ReservaDTO.
import cl.nutrivida.agendamiento.dto.ReservaDTO;
// Importa las excepciones del módulo.
import cl.nutrivida.agendamiento.exceptions.GlobalExceptionHandler;
import cl.nutrivida.agendamiento.exceptions.RecursoNoEncontradoException;
// Importa ReservaService.
import cl.nutrivida.agendamiento.service.ReservaService;
// Importa Test.
import org.junit.jupiter.api.Test;
// Importa ResponseEntity.
import org.springframework.http.ResponseEntity;
// Importa las aserciones de JUnit.
import static org.junit.jupiter.api.Assertions.*;
// Importa los métodos estáticos de Mockito.
import static org.mockito.Mockito.*;

// Define la clase.
class ReservaControllerTest {

    // Caso de prueba.
    @Test void crearDevuelveEstadoCreated201YReservaCreada() {
        // Construye un doble del servicio para controlar su respuesta.
        ReservaService service = mock(ReservaService.class);
        ReservaDTO entrada = new ReservaDTO();
        entrada.setServicio("Consulta Inicial");
        ReservaDTO guardada = new ReservaDTO();
        guardada.setReservaId(1L);
        guardada.setServicio("Consulta Inicial");
        when(service.crear(entrada)).thenReturn(guardada);
        // Prepara el controlador y ejecuta la solicitud POST.
        ReservaController controller = new ReservaController(service);
        ResponseEntity<ReservaDTO> respuesta = controller.crear(entrada);
        // Comprueba el código HTTP 201 y el cuerpo devuelto.
        assertEquals(201, respuesta.getStatusCode().value());
        assertNotNull(respuesta.getBody());
        assertEquals(1L, respuesta.getBody().getReservaId());
    }

    // Caso de prueba.
    @Test void listarActivasYActualizarDeleganEnElServicio() {
        // Construye un doble del servicio.
        ReservaService service = mock(ReservaService.class);
        ReservaDTO dto = new ReservaDTO();
        dto.setReservaId(2L);
        when(service.listarActivas()).thenReturn(List.of(dto));
        when(service.actualizar(2L, dto)).thenReturn(dto);
        // Prepara el controlador.
        ReservaController controller = new ReservaController(service);
        // Comprueba la respuesta de listado y actualización.
        assertEquals(1, controller.listarActivas().size());
        assertEquals(2L, controller.actualizar(2L, dto).getReservaId());
    }

    // Caso de prueba.
    @Test void cancelarDevuelveNoContent204() {
        // Construye un doble del servicio.
        ReservaService service = mock(ReservaService.class);
        ReservaController controller = new ReservaController(service);
        // Ejecuta la baja de la reserva.
        ResponseEntity<Void> respuesta = controller.cancelar(4L);
        // Comprueba el código HTTP 204 y la llamada al servicio.
        assertEquals(204, respuesta.getStatusCode().value());
        verify(service).cancelar(4L);
    }

    // Caso de prueba.
    @Test void globalExceptionHandlerTransformaErroresEnCodigosHttp404Y400() {
        // Prepara el manejador global de excepciones.
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        // Comprueba la conversión de RecursoNoEncontradoException en HTTP 404.
        ResponseEntity<Map<String, String>> noEncontrado = handler.handleNoEncontrado(
                new RecursoNoEncontradoException("Reserva no encontrada")
        );
        assertEquals(404, noEncontrado.getStatusCode().value());
        assertEquals("Reserva no encontrada", noEncontrado.getBody().get("mensaje"));
        // Comprueba la conversión de IllegalArgumentException en HTTP 400.
        ResponseEntity<Map<String, String>> validacion = handler.handleValidacion(
                new IllegalArgumentException("Horario inválido")
        );
        assertEquals(400, validacion.getStatusCode().value());
        assertEquals("Horario inválido", validacion.getBody().get("mensaje"));
    }
}


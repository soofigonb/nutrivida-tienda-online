// Pruebas del componente.

// Paquete de la clase.
package cl.nutrivida.pacientes.controller;

// Importa los tipos del paquete.
import java.util.List;
import java.util.Map;
// Importa PacienteDTO.
import cl.nutrivida.pacientes.dto.PacienteDTO;
// Importa las excepciones del módulo.
import cl.nutrivida.pacientes.exceptions.GlobalExceptionHandler;
import cl.nutrivida.pacientes.exceptions.RecursoNoEncontradoException;
// Importa PacienteService.
import cl.nutrivida.pacientes.service.PacienteService;
// Importa Test.
import org.junit.jupiter.api.Test;
// Importa ResponseEntity.
import org.springframework.http.ResponseEntity;
// Importa las aserciones de JUnit.
import static org.junit.jupiter.api.Assertions.*;
// Importa los métodos estáticos de Mockito.
import static org.mockito.Mockito.*;

// Define la clase.
class PacienteControllerTest {

    // Caso de prueba.
    @Test void crearDevuelveEstadoCreated201YPacienteCreado() {
        // Construye un doble del servicio para controlar su respuesta.
        PacienteService service = mock(PacienteService.class);
        PacienteDTO entrada = new PacienteDTO();
        entrada.setNombre("Valentina");
        PacienteDTO guardado = new PacienteDTO();
        guardado.setPacienteId(1L);
        guardado.setNombre("Valentina");
        when(service.crear(entrada)).thenReturn(guardado);
        // Prepara el controlador y ejecuta la solicitud POST.
        PacienteController controller = new PacienteController(service);
        ResponseEntity<PacienteDTO> respuesta = controller.crear(entrada);
        // Comprueba el código HTTP 201 y el cuerpo devuelto.
        assertEquals(201, respuesta.getStatusCode().value());
        assertNotNull(respuesta.getBody());
        assertEquals(1L, respuesta.getBody().getPacienteId());
    }

    // Caso de prueba.
    @Test void listarActivosObtenerPorIdYActualizarDeleganEnElServicio() {
        // Construye un doble del servicio.
        PacienteService service = mock(PacienteService.class);
        PacienteDTO dto = new PacienteDTO();
        dto.setPacienteId(3L);
        when(service.listarActivos()).thenReturn(List.of(dto));
        when(service.obtenerPorId(3L)).thenReturn(dto);
        when(service.actualizar(3L, dto)).thenReturn(dto);
        // Prepara el controlador.
        PacienteController controller = new PacienteController(service);
        // Comprueba la respuesta de listado, consulta por ID y actualización.
        assertEquals(1, controller.listarActivos().size());
        assertEquals(3L, controller.obtenerPorId(3L).getPacienteId());
        assertEquals(3L, controller.actualizar(3L, dto).getPacienteId());
    }

    // Caso de prueba.
    @Test void darDeBajaDevuelveNoContent204() {
        // Construye un doble del servicio.
        PacienteService service = mock(PacienteService.class);
        PacienteController controller = new PacienteController(service);
        // Ejecuta la baja del paciente.
        ResponseEntity<Void> respuesta = controller.darDeBaja(9L);
        // Comprueba el código HTTP 204 y la llamada al servicio.
        assertEquals(204, respuesta.getStatusCode().value());
        verify(service).darDeBaja(9L);
    }

    // Caso de prueba.
    @Test void globalExceptionHandlerTransformaErroresEnCodigosHttp404Y400() {
        // Prepara el manejador global de excepciones.
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        // Comprueba la conversión de RecursoNoEncontradoException en HTTP 404.
        ResponseEntity<Map<String, String>> noEncontrado = handler.handleNoEncontrado(
                new RecursoNoEncontradoException("Paciente no encontrado")
        );
        assertEquals(404, noEncontrado.getStatusCode().value());
        assertEquals("Paciente no encontrado", noEncontrado.getBody().get("mensaje"));
        // Comprueba la conversión de IllegalArgumentException en HTTP 400.
        ResponseEntity<Map<String, String>> validacion = handler.handleValidacion(
                new IllegalArgumentException("RUN inválido")
        );
        assertEquals(400, validacion.getStatusCode().value());
        assertEquals("RUN inválido", validacion.getBody().get("mensaje"));
    }
}

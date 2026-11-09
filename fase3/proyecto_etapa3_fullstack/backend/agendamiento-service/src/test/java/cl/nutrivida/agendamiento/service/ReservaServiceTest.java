// Pruebas del componente.

// Paquete de la clase.
package cl.nutrivida.agendamiento.service;

// Importa los tipos del paquete.
import java.util.*;
// Importa ReservaDTO.
import cl.nutrivida.agendamiento.dto.ReservaDTO;
// Importa RecursoNoEncontradoException.
import cl.nutrivida.agendamiento.exceptions.RecursoNoEncontradoException;
// Importa ReservaMapper.
import cl.nutrivida.agendamiento.mapper.ReservaMapper;
// Importa Reserva.
import cl.nutrivida.agendamiento.model.Reserva;
// Importa ReservaRepository.
import cl.nutrivida.agendamiento.repository.ReservaRepository;
// Importa los tipos de JUnit.
import org.junit.jupiter.api.*;
// Importa ExtendWith.
import org.junit.jupiter.api.extension.ExtendWith;
// Importa los tipos de Mockito.
import org.mockito.*;
// Importa MockitoExtension.
import org.mockito.junit.jupiter.MockitoExtension;
// Importa las aserciones de JUnit.
import static org.junit.jupiter.api.Assertions.*;
// Importa los métodos estáticos de Mockito.
import static org.mockito.Mockito.*;

// Activa MockitoExtension, que crea y gestiona los objetos marcados con @Mock.
@ExtendWith(MockitoExtension.class)
// Define la clase.
class ReservaServiceTest {

    // Simula la dependencia del repositorio de reservas.
    @Mock ReservaRepository repository;

    // Servicio que se prueba.
    ReservaService service;

    // Prepara objetos y respuestas antes de cada caso para mantener independientes las pruebas.
    @BeforeEach void preparar() {
        // Prepara el servicio con dependencias simuladas y el mapper real.
        service = new ReservaService(repository, new ReservaMapper());
    }

    // Construye un DTO válido base para reutilizar en los escenarios de prueba.
    private ReservaDTO dtoValido() {
        ReservaDTO dto = new ReservaDTO();
        dto.setPacienteId(1L);
        dto.setPlanId("plan-inicial");
        dto.setServicio("Consulta Nutricional Inicial");
        dto.setPrecio(25000);
        dto.setNutricionistaId(1L);
        dto.setNutricionistaNombre("Dra. Camila Rojas");
        dto.setFecha("2027-05-15");
        dto.setHora("09:00");
        dto.setMotivo("Evaluación nutricional inicial");
        return dto;
    }

    // Caso de prueba.
    @Test void creaReservaValidaYAsignaEstadoConfirmada() {
        // Prepara los datos de entrada.
        ReservaDTO dto = dtoValido();
        // Respuesta simulada sin conflicto de horario.
        when(repository.existsByNutricionistaIdAndFechaAndHoraAndActivoTrue(1L, "2027-05-15", "09:00"))
                .thenReturn(false);
        // Respuesta simulada al guardar en base de datos.
        when(repository.save(any(Reserva.class))).thenAnswer(i -> {
            Reserva r = i.getArgument(0);
            r.setReservaId(10L);
            return r;
        });
        // Ejecuta la creación de la reserva.
        ReservaDTO resultado = service.crear(dto);
        // Comprueba el identificador asignado, el estado y el indicador activo.
        assertEquals(10L, resultado.getReservaId());
        assertEquals("CONFIRMADA", resultado.getEstado());
        assertTrue(resultado.getActivo());
        verify(repository).save(any(Reserva.class));
    }

    // Caso de prueba.
    @Test void rechazaReservaConConflictoDeHorarioSinGuardar() {
        // Prepara los datos de entrada.
        ReservaDTO dto = dtoValido();
        // Simula que el profesional ya tiene una cita activa en esa misma fecha y hora.
        when(repository.existsByNutricionistaIdAndFechaAndHoraAndActivoTrue(1L, "2027-05-15", "09:00"))
                .thenReturn(true);
        // Comprueba la excepción esperada.
        assertThrows(IllegalArgumentException.class, () -> service.crear(dto));
        // Verifica que nunca se intente guardar una reserva duplicada de horario.
        verify(repository, never()).save(any());
    }

    // Caso de prueba.
    @Test void rechazaHorarioFueraDeBloquesPermitidos() {
        // Prepara un DTO con un horario no permitido por la clínica.
        ReservaDTO dto = dtoValido();
        dto.setHora("13:30");
        // Comprueba que la validación rechace el horario antes de consultar el repositorio.
        assertThrows(IllegalArgumentException.class, () -> service.crear(dto));
        verifyNoInteractions(repository);
    }

    // Caso de prueba.
    @Test void rechazaMotivoDemasiadoCortoOSinPlan() {
        // Prepara un DTO con motivo menor a 5 caracteres.
        ReservaDTO dto = dtoValido();
        dto.setMotivo("abc");
        // Comprueba la excepción por motivo inválido.
        assertThrows(IllegalArgumentException.class, () -> service.crear(dto));
        // Prepara un DTO sin identificador de plan.
        ReservaDTO sinPlan = dtoValido();
        sinPlan.setPlanId(" ");
        assertThrows(IllegalArgumentException.class, () -> service.crear(sinPlan));
        verifyNoInteractions(repository);
    }

    // Caso de prueba.
    @Test void actualizaReservaExistenteSinConflicto() {
        // Prepara una reserva existente almacenada.
        Reserva existente = new ReservaMapper().toEntity(dtoValido());
        existente.setReservaId(7L);
        when(repository.findById(7L)).thenReturn(Optional.of(existente));
        when(repository.existsByNutricionistaIdAndFechaAndHoraAndActivoTrueAndReservaIdNot(1L, "2027-05-20", "15:00", 7L))
                .thenReturn(false);
        when(repository.save(any(Reserva.class))).thenAnswer(i -> i.getArgument(0));
        // Prepara los nuevos datos de la reserva.
        ReservaDTO cambios = dtoValido();
        cambios.setFecha("2027-05-20");
        cambios.setHora("15:00");
        cambios.setMotivo("Control nutricional mensual");
        // Ejecuta la actualización.
        ReservaDTO actualizada = service.actualizar(7L, cambios);
        // Comprueba que se hayan aplicado los nuevos valores.
        assertEquals("2027-05-20", actualizada.getFecha());
        assertEquals("15:00", actualizada.getHora());
        assertEquals("Control nutricional mensual", actualizada.getMotivo());
    }

    // Caso de prueba.
    @Test void cancelarReservaCambiaEstadoACanceladaYDesactiva() {
        // Prepara una reserva activa en memoria.
        Reserva existente = new ReservaMapper().toEntity(dtoValido());
        existente.setReservaId(5L);
        when(repository.findById(5L)).thenReturn(Optional.of(existente));
        // Ejecuta la cancelación de la reserva.
        service.cancelar(5L);
        // Comprueba que el estado pase a CANCELADA y activo a false.
        assertEquals("CANCELADA", existente.getEstado());
        assertFalse(existente.getActivo());
        verify(repository).save(existente);
    }

    // Caso de prueba.
    @Test void obtenerPorIdInexistenteLanzaRecursoNoEncontrado() {
        // Simula que el identificador solicitado no existe en la base de datos.
        when(repository.findById(99L)).thenReturn(Optional.empty());
        // Comprueba la excepción esperada.
        assertThrows(RecursoNoEncontradoException.class, () -> service.obtenerPorId(99L));
    }
}

// Pruebas del componente.

// Paquete de la clase.
package cl.nutrivida.agendamiento.service;

import cl.nutrivida.agendamiento.client.ReservaReferencias;
import cl.nutrivida.agendamiento.exceptions.AccesoDenegadoException;
import org.springframework.security.oauth2.jwt.Jwt;
import java.time.LocalDate;

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

    @Test void consultaDisponibilidadDeUnHorarioFuturo() {
        String fecha = LocalDate.now().plusDays(2).toString();
        when(repository.existsByNutricionistaIdAndFechaAndHoraAndActivoTrue(1L, fecha, "09:00"))
                .thenReturn(true);

        assertFalse(service.estaDisponible(1L, fecha, "09:00"));
        assertTrue(service.estaDisponible(1L, fecha, "11:00"));
        assertThrows(IllegalArgumentException.class, () -> service.estaDisponible(1L, fecha, "10:00"));
    }

    @Test void validaUnidadYPrecioEnLaOrdenYRecuperaLaCitaEnUnReintento() {
        UUID cuenta = UUID.randomUUID();
        UUID orden = UUID.randomUUID();
        Jwt jwt = token(cuenta);
        ReservaDTO solicitud = dtoValido();
        solicitud.setOrdenId(orden);
        solicitud.setItemId(8L);
        solicitud.setUnidad(1);
        solicitud.setFecha(LocalDate.now().plusDays(3).toString());
        Reserva guardada = new Reserva();
        when(repository.findByOrdenIdAndItemIdAndUnidad(orden, 8L, 1))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(guardada));
        when(referencias.consultarItem(orden, 8L, 1, cuenta, jwt))
                .thenReturn(new ReservaReferencias.Item(8L, "Consulta validada", 1, 35000));
        when(referencias.consultarPaciente(jwt)).thenReturn(13L);
        when(referencias.consultarProfesional(1L)).thenReturn("Profesional validado");
        when(repository.save(any())).thenAnswer(invocacion -> {
            Reserva reserva = invocacion.getArgument(0);
            reserva.setReservaId(9L);
            guardada.setUsuarioId(cuenta);
            guardada.setReservaId(9L);
            return reserva;
        });

        ReservaDTO creada = service.crear(solicitud, jwt);
        assertEquals(35000, creada.getPrecio());
        assertEquals(13L, creada.getPacienteId());
        assertEquals("Consulta validada", creada.getServicio());
        assertEquals(9L, service.crear(solicitud, jwt).getReservaId());
        verify(repository, times(1)).save(any());
    }

    @Test void bloqueaLaConsultaDeUnaCitaAjena() {
        Reserva reserva = new Reserva();
        reserva.setUsuarioId(UUID.randomUUID());
        when(repository.findById(9L)).thenReturn(Optional.of(reserva));
        assertThrows(AccesoDenegadoException.class, () -> service.obtenerPorId(9L, token(UUID.randomUUID())));
    }

    @Test void reprogramarCitaPropiaConservaDatosDeLaCompra() {
        UUID cuenta = UUID.randomUUID();
        Reserva guardada = new ReservaMapper().toEntity(dtoValido());
        guardada.setReservaId(9L);
        guardada.setUsuarioId(cuenta);
        guardada.setOrdenId(UUID.randomUUID());
        when(repository.findById(9L)).thenReturn(Optional.of(guardada));
        when(repository.save(any())).thenAnswer(invocacion -> invocacion.getArgument(0));
        when(referencias.consultarProfesional(1L)).thenReturn("Nombre validado");
        ReservaDTO solicitud = dtoValido();
        solicitud.setFecha(LocalDate.now().plusDays(3).toString());
        solicitud.setHora("11:00");
        solicitud.setPacienteId(999L);
        solicitud.setPrecio(1);
        solicitud.setEstado("CANCELADA");

        ReservaDTO actualizada = service.actualizar(9L, solicitud, token(cuenta));
        assertEquals("11:00", actualizada.getHora());
        assertEquals(1L, actualizada.getPacienteId());
        assertEquals(25000, actualizada.getPrecio());
        assertEquals("CONFIRMADA", actualizada.getEstado());
    }

    @Test void rechazaUnaCompraSinUnidadOConUnaCitaCancelada() {
        UUID cuenta = UUID.randomUUID();
        Jwt jwt = token(cuenta);
        ReservaDTO solicitud = dtoValido();
        assertThrows(IllegalArgumentException.class, () -> service.crear(solicitud, jwt));
        UUID orden = UUID.randomUUID();
        solicitud.setOrdenId(orden);
        solicitud.setItemId(8L);
        solicitud.setUnidad(1);
        Reserva cancelada = new Reserva();
        cancelada.setUsuarioId(cuenta);
        cancelada.setActivo(false);
        when(repository.findByOrdenIdAndItemIdAndUnidad(orden, 8L, 1)).thenReturn(Optional.of(cancelada));
        assertThrows(IllegalArgumentException.class, () -> service.crear(solicitud, jwt));
        verifyNoInteractions(referencias);
    }

    @Test void consultaSoloCitasPropiasYRechazaHorariosInvalidos() {
        UUID cuenta = UUID.randomUUID();
        Jwt jwt = token(cuenta);
        Reserva guardada = new ReservaMapper().toEntity(dtoValido());
        guardada.setUsuarioId(cuenta);
        when(repository.findByUsuarioIdAndActivoTrue(cuenta)).thenReturn(List.of(guardada));
        when(repository.findById(9L)).thenReturn(Optional.of(guardada));
        when(referencias.consultarProfesional(1L)).thenReturn("Profesional validado");

        assertEquals(1, service.listarActivas(jwt).size());
        verify(repository, never()).findByActivoTrue();
        ReservaDTO solicitud = dtoValido();
        solicitud.setFecha("2025-02-30");
        assertThrows(IllegalArgumentException.class, () -> service.actualizar(9L, solicitud, jwt));
        solicitud.setFecha(LocalDate.now().minusDays(2).toString());
        assertThrows(IllegalArgumentException.class, () -> service.actualizar(9L, solicitud, jwt));
        verify(repository, never()).save(any());
    }

    private Jwt token(UUID usuario) {
        return Jwt.withTokenValue("prueba").header("alg", "RS256")
                .subject(usuario.toString()).claim("roles", List.of("CLIENTE")).build();
    }

    // Simula la dependencia del repositorio de reservas.
    @Mock ReservaRepository repository;
    @Mock ReservaReferencias referencias;

    // Servicio que se prueba.
    ReservaService service;

    // Prepara objetos y respuestas antes de cada caso para mantener independientes las pruebas.
    @BeforeEach void preparar() {
        // Prepara el servicio con dependencias simuladas y el mapper real.
        service = new ReservaService(repository, new ReservaMapper(), referencias);
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
    @Test void listarActivasYObtenerPorIdExistenteDevuelvenReservas() {
        // Prepara una entidad activa simulada en el repositorio.
        Reserva entidad = new ReservaMapper().toEntity(dtoValido());
        entidad.setReservaId(3L);
        when(repository.findByActivoTrue()).thenReturn(List.of(entidad));
        when(repository.findById(3L)).thenReturn(Optional.of(entidad));
        // Comprueba la lista de reservas activas y la búsqueda por ID.
        List<ReservaDTO> lista = service.listarActivas();
        assertEquals(1, lista.size());
        assertEquals(3L, service.obtenerPorId(3L).getReservaId());
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
    @Test void rechazaCamposObligatoriosInvalidosEnReserva() {
        // Motivo demasiado corto.
        ReservaDTO motivoCorto = dtoValido();
        motivoCorto.setMotivo("abc");
        assertThrows(IllegalArgumentException.class, () -> service.crear(motivoCorto));
        // Sin identificador de plan.
        ReservaDTO sinPlan = dtoValido();
        sinPlan.setPlanId(" ");
        assertThrows(IllegalArgumentException.class, () -> service.crear(sinPlan));
        // Sin nombre de servicio.
        ReservaDTO sinServicio = dtoValido();
        sinServicio.setServicio(" ");
        assertThrows(IllegalArgumentException.class, () -> service.crear(sinServicio));
        // Precio menor o igual a cero.
        ReservaDTO precioInvalido = dtoValido();
        precioInvalido.setPrecio(0);
        assertThrows(IllegalArgumentException.class, () -> service.crear(precioInvalido));
        // Sin nutricionistaId.
        ReservaDTO sinNutricionista = dtoValido();
        sinNutricionista.setNutricionistaId(null);
        assertThrows(IllegalArgumentException.class, () -> service.crear(sinNutricionista));
        // Sin nombre de nutricionista.
        ReservaDTO sinNombreNutri = dtoValido();
        sinNombreNutri.setNutricionistaNombre(" ");
        assertThrows(IllegalArgumentException.class, () -> service.crear(sinNombreNutri));
        // Fecha con formato inválido.
        ReservaDTO fechaInvalida = dtoValido();
        fechaInvalida.setFecha("15-05-2027");
        assertThrows(IllegalArgumentException.class, () -> service.crear(fechaInvalida));
        verifyNoInteractions(repository);
    }

    // Caso de prueba.
    @Test void actualizaReservaExistenteYRechazaConflictoAlActualizar() {
        // Prepara una reserva existente almacenada.
        Reserva existente = new ReservaMapper().toEntity(dtoValido());
        existente.setReservaId(7L);
        when(repository.findById(7L)).thenReturn(Optional.of(existente));
        when(repository.existsByNutricionistaIdAndFechaAndHoraAndActivoTrueAndReservaIdNot(1L, "2027-05-20", "15:00", 7L))
                .thenReturn(false);
        when(repository.save(any(Reserva.class))).thenAnswer(i -> i.getArgument(0));
        // Prepara los nuevos datos de la reserva incluyendo estado explícito.
        ReservaDTO cambios = dtoValido();
        cambios.setFecha("2027-05-20");
        cambios.setHora("15:00");
        cambios.setMotivo("Control nutricional mensual");
        cambios.setEstado("REPROGRAMADA");
        // Ejecuta la actualización sin conflicto.
        ReservaDTO actualizada = service.actualizar(7L, cambios);
        assertEquals("2027-05-20", actualizada.getFecha());
        assertEquals("15:00", actualizada.getHora());
        assertEquals("REPROGRAMADA", actualizada.getEstado());
        // Simula ahora un conflicto de horario al intentar actualizar.
        when(repository.existsByNutricionistaIdAndFechaAndHoraAndActivoTrueAndReservaIdNot(1L, "2027-05-20", "15:00", 7L))
                .thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> service.actualizar(7L, cambios));
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

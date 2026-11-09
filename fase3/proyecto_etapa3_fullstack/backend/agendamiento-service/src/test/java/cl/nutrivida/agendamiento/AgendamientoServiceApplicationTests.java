package cl.nutrivida.agendamiento;

import cl.nutrivida.agendamiento.dto.ReservaDTO;
import cl.nutrivida.agendamiento.exceptions.RecursoNoEncontradoException;
import cl.nutrivida.agendamiento.mapper.ReservaMapper;
import cl.nutrivida.agendamiento.model.Reserva;
import cl.nutrivida.agendamiento.repository.ReservaRepository;
import cl.nutrivida.agendamiento.service.ReservaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AgendamientoServiceApplicationTests {

    private ReservaRepository repository;
    private ReservaMapper mapper;
    private ReservaService service;

    @BeforeEach
    void setUp() {
        repository = Mockito.mock(ReservaRepository.class);
        mapper = new ReservaMapper();
        service = new ReservaService(repository, mapper);
    }

    private ReservaDTO crearReservaValidaDTO() {
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

    @Test
    void crearReservaValidaRetornaDTOGuardado() {
        ReservaDTO dto = crearReservaValidaDTO();
        when(repository.existsByNutricionistaIdAndFechaAndHoraAndActivoTrue(1L, "2027-05-15", "09:00"))
                .thenReturn(false);
        when(repository.save(any(Reserva.class))).thenAnswer(inv -> {
            Reserva r = inv.getArgument(0);
            r.setReservaId(10L);
            return r;
        });

        ReservaDTO creada = service.crear(dto);

        assertNotNull(creada.getReservaId());
        assertEquals(10L, creada.getReservaId());
        assertEquals("CONFIRMADA", creada.getEstado());
        assertTrue(creada.getActivo());
    }

    @Test
    void crearReservaConConflictoHorarioLanzaExcepcion() {
        ReservaDTO dto = crearReservaValidaDTO();
        when(repository.existsByNutricionistaIdAndFechaAndHoraAndActivoTrue(1L, "2027-05-15", "09:00"))
                .thenReturn(true);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.crear(dto)
        );
        assertTrue(ex.getMessage().contains("ya tiene una reserva"));
    }

    @Test
    void obtenerPorIdNoExistenteLanzaRecursoNoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(
                RecursoNoEncontradoException.class,
                () -> service.obtenerPorId(99L)
        );
    }

    @Test
    void cancelarReservaCambiaEstadoYDesactiva() {
        Reserva r = mapper.toEntity(crearReservaValidaDTO());
        r.setReservaId(5L);
        when(repository.findById(5L)).thenReturn(Optional.of(r));

        service.cancelar(5L);

        assertEquals("CANCELADA", r.getEstado());
        assertFalse(r.getActivo());
        verify(repository).save(r);
    }

    @Test
    void listarActivasDevuelveListaMapeada() {
        Reserva r = mapper.toEntity(crearReservaValidaDTO());
        r.setReservaId(1L);
        when(repository.findByActivoTrue()).thenReturn(List.of(r));

        List<ReservaDTO> lista = service.listarActivas();

        assertEquals(1, lista.size());
        assertEquals("Dra. Camila Rojas", lista.get(0).getNutricionistaNombre());
    }
}

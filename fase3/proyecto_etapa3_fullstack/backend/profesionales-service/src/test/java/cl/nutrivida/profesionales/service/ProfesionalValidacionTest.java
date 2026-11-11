package cl.nutrivida.profesionales.service;

import cl.nutrivida.profesionales.dto.ProfesionalDTO;
import cl.nutrivida.profesionales.dto.ProfesionalMapper;
import cl.nutrivida.profesionales.model.Profesional;
import cl.nutrivida.profesionales.repository.ProfesionalRepository;
import java.util.List;
import java.util.function.Consumer;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProfesionalValidacionTest {
    @Test
    void rechazaCamposObligatoriosYExperienciaInvalida() {
        var repository = mock(ProfesionalRepository.class);
        var servicio = new ProfesionalService(repository, new ProfesionalMapper());
        List<Consumer<ProfesionalDTO>> cambios = List.of(
                d -> d.setNombre(null), d -> d.setNombre(" "),
                d -> d.setEspecialidad(null), d -> d.setEspecialidad(" "),
                d -> d.setExperiencia(null), d -> d.setExperiencia(-1),
                d -> d.setModalidad(null), d -> d.setModalidad(" "),
                d -> d.setModalidad("Desconocida"));
        for (var cambio : cambios) {
            var dto = datos();
            cambio.accept(dto);
            assertThrows(IllegalArgumentException.class, () -> servicio.crear(dto));
        }
        verifyNoInteractions(repository);
    }

    @Test
    void aceptaLasTresModalidadesYExperienciaCero() {
        var repository = mock(ProfesionalRepository.class);
        when(repository.save(any(Profesional.class))).thenAnswer(i -> i.getArgument(0));
        var servicio = new ProfesionalService(repository, new ProfesionalMapper());
        for (String modalidad : List.of("Presencial", "Online", "Mixta")) {
            var dto = datos();
            dto.setModalidad(modalidad);
            assertEquals(modalidad, servicio.crear(dto).getModalidad());
        }
    }

    private ProfesionalDTO datos() {
        var dto = new ProfesionalDTO();
        dto.setNombre("Profesional de prueba");
        dto.setEspecialidad("Nutrición");
        dto.setExperiencia(0);
        dto.setModalidad("Presencial");
        return dto;
    }
}

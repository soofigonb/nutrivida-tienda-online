package cl.nutrivida.profesionales;

import cl.nutrivida.profesionales.controller.ProfesionalController;
import cl.nutrivida.profesionales.dto.ProfesionalMapper;
import cl.nutrivida.profesionales.exceptions.GlobalExceptionHandler;
import cl.nutrivida.profesionales.model.Profesional;
import cl.nutrivida.profesionales.repository.ProfesionalRepository;
import cl.nutrivida.profesionales.service.ProfesionalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ProfesionalApiTest {
    private static final String RUTA = "/api/v1/profesionales";
    private final ProfesionalRepository repository = mock(ProfesionalRepository.class);
    private final Profesional profesional = new Profesional();
    private MockMvc api;

    @BeforeEach
    void preparar() {
        profesional.setProfesionalId(1L);
        profesional.setNombre("Profesional de prueba");
        profesional.setEspecialidad("Soporte técnico");
        when(repository.findByActivoTrue()).thenReturn(List.of(profesional));
        when(repository.findById(1L)).thenReturn(Optional.of(profesional));
        when(repository.save(any(Profesional.class))).thenAnswer(invocacion -> {
            Profesional guardado = invocacion.getArgument(0);
            guardado.setProfesionalId(1L);
            return guardado;
        });
        var servicio = new ProfesionalService(repository, new ProfesionalMapper());
        api = MockMvcBuilders.standaloneSetup(new ProfesionalController(servicio))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test
    void listaYConsultaProfesionalesActivos() throws Exception {
        api.perform(get(RUTA)).andExpect(status().isOk()).andExpect(jsonPath("$[0].profesionalId").value(1));
        api.perform(get(RUTA + "/1")).andExpect(status().isOk()).andExpect(jsonPath("$.especialidad").value("Soporte técnico"));
        api.perform(get(RUTA + "/2")).andExpect(status().isNotFound());
    }

    @Test
    void creaActualizaYDaDeBajaUnProfesional() throws Exception {
        api.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(profesionalJson(4, "Mixta")))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.activo").value(true));
        api.perform(put(RUTA + "/1").contentType(MediaType.APPLICATION_JSON).content(profesionalJson(5, "Online")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.experiencia").value(5));
        api.perform(delete(RUTA + "/1")).andExpect(status().isNoContent());
        assertFalse(profesional.getActivo());
        api.perform(get(RUTA + "/1")).andExpect(status().isNotFound());
    }

    @Test
    void rechazaExperienciaNegativaYModalidadInvalida() throws Exception {
        api.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(profesionalJson(-1, "Mixta")))
                .andExpect(status().isBadRequest());
        api.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(profesionalJson(3, "Otra")))
                .andExpect(status().isBadRequest());
    }

    private String profesionalJson(int experiencia, String modalidad) {
        return """
                {"nombre":"Profesional de prueba","especialidad":"Soporte técnico","experiencia":%d,"modalidad":"%s"}
                """.formatted(experiencia, modalidad);
    }
}

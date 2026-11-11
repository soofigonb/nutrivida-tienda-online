package cl.nutrivida.pacientes.controller;

import cl.nutrivida.pacientes.config.SecurityConfig;
import cl.nutrivida.pacientes.service.PacienteService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
@ContextConfiguration(classes = {PacienteController.class, SecurityConfig.class})
class PacienteAccesoHttpTest {
    private static final String BASE = "/api/v1/pacientes";

    @Autowired MockMvc mvc;
    @MockitoBean PacienteService servicio;
    @MockitoBean JwtDecoder decoder;

    @Test
    void aplicaLosPermisosDeConsulta() throws Exception {
        token("vendedor", "VENDEDOR");
        token("cliente", "CLIENTE");
        token("admin", "ADMINISTRADOR");
        mvc.perform(get(BASE)).andExpect(status().isUnauthorized());
        mvc.perform(get(BASE).header("Authorization", "Bearer vendedor")).andExpect(status().isForbidden());
        mvc.perform(get(BASE).header("Authorization", "Bearer cliente")).andExpect(status().isForbidden());
        mvc.perform(get(BASE).header("Authorization", "Bearer admin"))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    private void token(String valor, String rol) {
        when(decoder.decode(valor)).thenReturn(Jwt.withTokenValue(valor)
                .header("alg", "RS256").subject("713abff5-fb56-4a51-a836-05d05045f337")
                .claim("roles", List.of(rol)).build());
    }
}

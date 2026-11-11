package cl.nutrivida.agendamiento.controller;

import cl.nutrivida.agendamiento.config.SecurityConfig;
import cl.nutrivida.agendamiento.service.ReservaService;
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
@ContextConfiguration(classes = {ReservaController.class, SecurityConfig.class})
class ReservaAccesoHttpTest {
    private static final String BASE = "/api/v1/agendamiento";

    @Autowired MockMvc mvc;
    @MockitoBean ReservaService servicio;
    @MockitoBean JwtDecoder decoder;

    @Test
    void aplicaLosPermisosDeConsulta() throws Exception {
        token("vendedor", "VENDEDOR");
        token("cliente", "CLIENTE");
        mvc.perform(get(BASE + "/disponibilidad")
                .param("nutricionistaId", "1").param("fecha", "2030-01-01").param("hora", "09:00"))
                .andExpect(status().isOk()).andExpect(content().string("false"));
        mvc.perform(get(BASE)).andExpect(status().isUnauthorized());
        mvc.perform(get(BASE).header("Authorization", "Bearer vendedor")).andExpect(status().isForbidden());
        mvc.perform(get(BASE).header("Authorization", "Bearer cliente"))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    private void token(String valor, String rol) {
        when(decoder.decode(valor)).thenReturn(Jwt.withTokenValue(valor)
                .header("alg", "RS256").subject("713abff5-fb56-4a51-a836-05d05045f337")
                .claim("roles", List.of(rol)).build());
    }
}

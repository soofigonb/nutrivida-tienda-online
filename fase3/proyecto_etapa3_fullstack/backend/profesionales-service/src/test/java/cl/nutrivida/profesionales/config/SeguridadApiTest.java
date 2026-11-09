package cl.nutrivida.profesionales.config;

import cl.nutrivida.profesionales.controller.ProfesionalController;
import cl.nutrivida.profesionales.service.ProfesionalService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProfesionalController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = {"app.security.roles-claim=perfiles", "app.security.write-role=EDITOR"})
class SeguridadApiTest {
    @Autowired
    private MockMvc api;
    @MockitoBean
    private JwtDecoder decoder;
    @MockitoBean
    private ProfesionalService servicio;

    @Test
    void usaElRolYElClaimDelProyectoQueIntegraLaApi() throws Exception {
        when(decoder.decode("editor")).thenReturn(token("editor", "EDITOR"));
        when(decoder.decode("lector")).thenReturn(token("lector", "LECTOR"));
        api.perform(get("/api/v1/profesionales")).andExpect(status().isOk());
        api.perform(delete("/api/v1/profesionales/1"))
                .andExpect(status().isUnauthorized());
        api.perform(delete("/api/v1/profesionales/1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer lector")).andExpect(status().isForbidden());
        api.perform(delete("/api/v1/profesionales/1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer editor")).andExpect(status().isNoContent());
    }

    private Jwt token(String valor, String rol) {
        return Jwt.withTokenValue(valor).header("alg", "RS256")
                .subject("cuenta").claim("perfiles", List.of(rol)).build();
    }
}

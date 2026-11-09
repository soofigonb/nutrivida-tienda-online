// Pruebas del componente.

// Paquete de la clase.
package cl.nutrivida.autenticacion.controller;

// Importa UUID.
import java.util.UUID;
// Importa los tipos del paquete.
import cl.nutrivida.autenticacion.dto.*;
// Importa AutenticacionService.
import cl.nutrivida.autenticacion.service.AutenticacionService;
// Importa Test.
import org.junit.jupiter.api.Test;
// Importa ResponseStatusException.
import org.springframework.web.server.ResponseStatusException;
// Importa los tipos del paquete.
import static org.junit.jupiter.api.Assertions.*;
// Importa los tipos del paquete.
import static org.mockito.Mockito.*;

// Define la clase.
class SesionWebControllerTest {
    @Test void vigenciaDeCookieUtilizaLaDuracionConfigurada() {
        AutenticacionService service = mock(AutenticacionService.class);
        LoginDTO dto = new LoginDTO("cliente@duoc.cl", "Clave123");
        when(service.login(dto)).thenReturn(new SesionDTO("jwt", "secreto", "Bearer", 900,
            new UsuarioDTO(UUID.randomUUID(), dto.correo(), "CLIENTE", "ACTIVO")));
        var controller = new SesionWebController(service, "https://nutrivida.example", true, java.time.Duration.ofHours(2));
        assertTrue(controller.login("https://nutrivida.example", dto).getHeaders().getFirst("Set-Cookie").contains("Max-Age=7200"));
    }
    // Caso de prueba.
    @Test void cookieDeRenovacionEsHttpOnlyYNoSeEntregaEnJson() {
        AutenticacionService service = mock(AutenticacionService.class);
        LoginDTO dto = new LoginDTO("cliente@duoc.cl", "Clave123");
        // Respuesta simulada.
        when(service.login(dto)).thenReturn(new SesionDTO("jwt", "secreto", "Bearer", 900,
            new UsuarioDTO(UUID.randomUUID(), dto.correo(), "CLIENTE", "ACTIVO")));
        // Prepara el controlador y sus cookies.
        var controller = new SesionWebController(service, "https://nutrivida.example", true, java.time.Duration.ofDays(7));
        // Ejecuta y comprueba la respuesta web.
        var respuesta = controller.login("https://nutrivida.example", dto);
        String cookie = respuesta.getHeaders().getFirst("Set-Cookie");
        assertNotNull(cookie);
        // Verifica la condición.
        assertTrue(cookie.contains("HttpOnly"));
        // Verifica la condición.
        assertTrue(cookie.contains("Secure"));
        // Verifica la condición.
        assertTrue(cookie.contains("SameSite=Strict"));
        // Comprueba el resultado.
        assertEquals("jwt", respuesta.getBody().accessToken());
        // Verifica la condición.
        assertFalse(respuesta.getBody().toString().contains("secreto"));
        // Comprueba el resultado.
        assertEquals("no-store", respuesta.getHeaders().getCacheControl());
    }
    // Caso de prueba.
    @Test void renovacionDesdeOtroOrigenSeRechazaAntesDeAccederAlServicio() {
        AutenticacionService service = mock(AutenticacionService.class);
        // Prepara el controlador y sus cookies.
        var controller = new SesionWebController(service, "https://nutrivida.example", true, java.time.Duration.ofDays(7));
        // Comprueba la excepción esperada.
        assertThrows(ResponseStatusException.class, () -> controller.renovar("https://externo.example", "token"));
        // Comprueba que no hubo llamadas adicionales.
        verifyNoInteractions(service);
    }
    // Caso de prueba.
    @Test void logoutBorraLaCookieConLaMismaRuta() {
        AutenticacionService service = mock(AutenticacionService.class);
        // Prepara el controlador y sus cookies.
        var controller = new SesionWebController(service, "https://nutrivida.example", true, java.time.Duration.ofDays(7));
        // Ejecuta y comprueba la respuesta web.
        var respuesta = controller.logout("https://nutrivida.example", "token");
        // Comprueba el resultado.
        assertEquals(204, respuesta.getStatusCode().value());
        // Verifica la condición.
        assertTrue(respuesta.getHeaders().getFirst("Set-Cookie").contains("Max-Age=0"));
        // Verifica las llamadas esperadas.
        verify(service).logout("token");
    }
}

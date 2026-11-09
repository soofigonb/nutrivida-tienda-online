// Sesión web con cookie HttpOnly.

// Paquete de la clase.
package cl.nutrivida.autenticacion.controller;

// Importa Duration.
import java.time.Duration;
// Importa los tipos del paquete.
import cl.nutrivida.autenticacion.dto.*;
// Importa AutenticacionService.
import cl.nutrivida.autenticacion.service.AutenticacionService;
// Importa Valid.
import jakarta.validation.Valid;
// Importa Value.
import org.springframework.beans.factory.annotation.Value;
// Importa los tipos del paquete.
import org.springframework.http.*;
// Importa los tipos del paquete.
import org.springframework.web.bind.annotation.*;
// Importa ResponseStatusException.
import org.springframework.web.server.ResponseStatusException;

/** El navegador conserva la renovación en una cookie inaccesible desde JavaScript. */
// Registra un controlador REST.
@RestController
// Prefijo de las rutas del controlador.
@RequestMapping("/api/v1/autenticacion/web")
// Define la clase.
public class SesionWebController {
    // Servicio que contiene las reglas de negocio.
    private final AutenticacionService service;
    private final String origin;
    // Indica si la cookie solo puede viajar mediante HTTPS.
    private final boolean secure;
    private final Duration refreshDuration;
    public record SesionWebDTO(String accessToken, long expiresIn, UsuarioDTO usuario) {}
    public SesionWebController(AutenticacionService service,
        // Lee la propiedad de configuración.
        @Value("${FRONTEND_URL:http://localhost:5173}") String origin,
        // Lee la propiedad de configuración.
        @Value("${SESSION_COOKIE_SECURE:false}") boolean secure,
        @Value("${app.jwt.refresh-token-duration:7d}") Duration refreshDuration) {
        // Guarda las dependencias y opciones.
        this.service = service; this.origin = origin; this.secure = secure;
        this.refreshDuration = refreshDuration;
    }
    // Asocia el método HTTP y la ruta.
    @PostMapping("/login")
    // Declara la operación web y lee la cabecera Origin.
    ResponseEntity<SesionWebDTO> login(@RequestHeader(value = "Origin", required = false) String origen,
                                      // Valida el JSON recibido.
                                      @Valid @RequestBody LoginDTO dto) {
        validarOrigen(origen);
        return respuesta(service.login(dto));
    }
    // Asocia el método HTTP y la ruta.
    @PostMapping("/renovar")
    // Declara la operación web y lee la cabecera Origin.
    ResponseEntity<SesionWebDTO> renovar(@RequestHeader(value = "Origin", required = false) String origen,
        @CookieValue(value = "nutrivida_refresh", defaultValue = "") String refresh) {
        validarOrigen(origen);
        return respuesta(service.renovar(refresh));
    }
    // Asocia el método HTTP y la ruta.
    @PostMapping("/logout")
    // Declara la operación web y lee la cabecera Origin.
    ResponseEntity<Void> logout(@RequestHeader(value = "Origin", required = false) String origen,
        @CookieValue(value = "nutrivida_refresh", defaultValue = "") String refresh) {
        validarOrigen(origen); service.logout(refresh);
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO).toString()).build();
    }
    private ResponseEntity<SesionWebDTO> respuesta(SesionDTO sesion) {
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie(sesion.refreshToken(), refreshDuration).toString())
            .header(HttpHeaders.CACHE_CONTROL, "no-store")
            // Entrega solo JWT de acceso, duración y usuario en JSON.
            .body(new SesionWebDTO(sesion.accessToken(), sesion.expiresIn(), sesion.usuario()));
    }
    private ResponseCookie cookie(String token, Duration duration) {
        return ResponseCookie.from("nutrivida_refresh", token).httpOnly(true).secure(secure)
            .sameSite("Strict").path("/api/v1/autenticacion/web").maxAge(duration).build();
    }
    private void validarOrigen(String origen) {
        // Solo acepta el origen web configurado.
        if (!origin.equals(origen)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Origen no autorizado");
    }
}

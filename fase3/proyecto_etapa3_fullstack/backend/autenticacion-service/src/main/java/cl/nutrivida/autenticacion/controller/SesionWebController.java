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
    // Origen autorizado del frontend, obtenido de la configuración de entorno.
    private final String origin;
    // Indica si la cookie solo puede viajar mediante HTTPS.
    private final boolean secure;
    // Comparte la vigencia del secreto con el servicio que lo emite.
    private final Duration refreshDuration;
    // Respuesta web con JWT de acceso, segundos de vigencia y usuario.
    public record SesionWebDTO(String accessToken, long expiresIn, UsuarioDTO usuario) {}
    // Constructor que Spring utiliza para inyectar el servicio y las propiedades del frontend y de la cookie.
    public SesionWebController(AutenticacionService service,
        // Lee la propiedad de configuración.
        @Value("${FRONTEND_URL:http://localhost:5173}") String origin,
        // Lee la propiedad de configuración.
        @Value("${SESSION_COOKIE_SECURE:false}") boolean secure,
        // Una sola propiedad controla la vigencia del token y la cookie.
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
        // Exige que Origin coincida con el frontend autorizado antes de utilizar o emitir la cookie de renovación.
        validarOrigen(origen);
        // Verifica las credenciales en el servicio y transforma la sesión en respuesta web con cookie HttpOnly.
        return respuesta(service.login(dto));
    }
    // Asocia el método HTTP y la ruta.
    @PostMapping("/renovar")
    // Declara la operación web y lee la cabecera Origin.
    ResponseEntity<SesionWebDTO> renovar(@RequestHeader(value = "Origin", required = false) String origen,
        // Completa los parámetros leyendo la cookie nutrivida_refresh.
        @CookieValue(value = "nutrivida_refresh", defaultValue = "") String refresh) {
        // Exige que Origin coincida con el frontend autorizado antes de utilizar o emitir la cookie de renovación.
        validarOrigen(origen);
        // Rota el secreto recibido en la cookie y prepara un JWT nuevo y una cookie de reemplazo.
        return respuesta(service.renovar(refresh));
    }
    // Asocia el método HTTP y la ruta.
    @PostMapping("/logout")
    // Declara la operación web y lee la cabecera Origin.
    ResponseEntity<Void> logout(@RequestHeader(value = "Origin", required = false) String origen,
        // Completa los parámetros leyendo la cookie nutrivida_refresh.
        @CookieValue(value = "nutrivida_refresh", defaultValue = "") String refresh) {
        // Comprueba el origen y revoca el token enviado en la cookie.
        validarOrigen(origen); service.logout(refresh);
        // Responde 204 sin cuerpo y envía la cookie vacía con duración cero y la misma ruta para eliminarla.
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO).toString()).build();
    }
    // Prepara la respuesta de sesión del navegador con JWT en JSON y secreto de renovación en cookie HttpOnly.
    private ResponseEntity<SesionWebDTO> respuesta(SesionDTO sesion) {
        // La cookie utiliza la misma duración configurada para el secreto renovable.
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie(sesion.refreshToken(), refreshDuration).toString())
            // Indica a navegadores e intermediarios que no almacenen en caché la respuesta de autenticación.
            .header(HttpHeaders.CACHE_CONTROL, "no-store")
            // Entrega solo JWT de acceso, duración y usuario en JSON.
            .body(new SesionWebDTO(sesion.accessToken(), sesion.expiresIn(), sesion.usuario()));
    }
    // Construye la cookie con sus opciones de seguridad, ruta y duración.
    private ResponseCookie cookie(String token, Duration duration) {
        // Crea la cookie de renovación: HttpOnly impide leerla desde JavaScript.
        return ResponseCookie.from("nutrivida_refresh", token).httpOnly(true).secure(secure)
            // Restringe la cookie a solicitudes del mismo sitio, a las rutas web de autenticación y al tiempo indicado.
            .sameSite("Strict").path("/api/v1/autenticacion/web").maxAge(duration).build();
    }
    // Compara el origen de la solicitud con el frontend configurado antes de utilizar cookies.
    private void validarOrigen(String origen) {
        // Solo acepta el origen web configurado.
        if (!origin.equals(origen)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Origen no autorizado");
    }
}

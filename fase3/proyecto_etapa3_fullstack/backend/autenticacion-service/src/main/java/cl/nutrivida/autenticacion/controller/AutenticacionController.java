// Expone registro, login, renovación, cuentas y la clave pública.

// Paquete de la clase.
package cl.nutrivida.autenticacion.controller;

// Importa los tipos del paquete.
import java.util.*;
// Importa los tipos del paquete.
import com.nimbusds.jose.jwk.*;
// Importa los tipos del paquete.
import cl.nutrivida.autenticacion.dto.*;
// Importa AutenticacionService.
import cl.nutrivida.autenticacion.service.AutenticacionService;
// Importa Operation.
import io.swagger.v3.oas.annotations.Operation;
// Indica a Swagger qué operaciones deben enviar el JWT del botón Authorize.
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
// Importa Tag.
import io.swagger.v3.oas.annotations.tags.Tag;
// Importa Valid.
import jakarta.validation.Valid;
// Importa NotBlank.
import jakarta.validation.constraints.NotBlank;
// Importa RequiredArgsConstructor.
import lombok.RequiredArgsConstructor;
// Importa ResponseEntity.
import org.springframework.http.ResponseEntity;
// Importa PreAuthorize.
import org.springframework.security.access.prepost.PreAuthorize;
// Importa AuthenticationPrincipal.
import org.springframework.security.core.annotation.AuthenticationPrincipal;
// Importa Jwt.
import org.springframework.security.oauth2.jwt.Jwt;
// Importa los tipos del paquete.
import org.springframework.web.bind.annotation.*;

// Registra un controlador REST.
@RestController
// Genera el constructor de dependencias.
@RequiredArgsConstructor
// Agrupa estas operaciones en la sección de Swagger cuyo nombre indica la anotación.
@Tag(name = "Autenticación", description = "Cuentas, sesiones JWT y permisos")
// Define la clase.
public class AutenticacionController {
    // Servicio que contiene las reglas de negocio.
    private final AutenticacionService service;
    // Par de claves RSA.
    private final RSAKey key;
    // Define una constante con el prefijo versionado común de las rutas de autenticación.
    private static final String BASE = "/api/v1/autenticacion";
    // DTO de administración: rol y estado son textos obligatorios.
    public record PermisosDTO(@NotBlank String rol, @NotBlank String estado) {}

    // Describe la operación en Swagger.
    @Operation(summary = "Registrar una cuenta de cliente")
    // Asocia el método HTTP y la ruta.
    @PostMapping(BASE + "/registro")
    // Recibe datos de registro y crea una cuenta cliente.
    ResponseEntity<UsuarioDTO> registrar(@Valid @RequestBody RegistroDTO dto) {
        // Ejecuta el alta del servicio y devuelve HTTP 201 Created con el DTO creado como cuerpo JSON.
        return ResponseEntity.status(201).body(service.registrar(dto));
    }
    // Describe la operación en Swagger.
    @Operation(summary = "Iniciar sesión")
    // Asocia el método HTTP y la ruta.
    @PostMapping(BASE + "/login")
    // Valida las credenciales e inicia sesión.
    SesionDTO login(@Valid @RequestBody LoginDTO dto) { return service.login(dto); }
    // Describe la operación en Swagger.
    @Operation(summary = "Renovar y rotar los tokens de sesión")
    // Asocia el método HTTP y la ruta.
    @PostMapping(BASE + "/renovar")
    // Valida y rota el token de renovación.
    SesionDTO renovar(@Valid @RequestBody RenovacionDTO dto) { return service.renovar(dto.refreshToken()); }
    // Describe la operación en Swagger.
    @Operation(summary = "Revocar un token de renovación")
    // Asocia el método HTTP y la ruta.
    @PostMapping(BASE + "/logout")
    // Cierra la posibilidad de renovar esa sesión.
    ResponseEntity<Void> logout(@Valid @RequestBody RenovacionDTO dto) {
        // Revoca el secreto de renovación y devuelve 204 sin cuerpo para confirmar el cierre.
        service.logout(dto.refreshToken()); return ResponseEntity.noContent().build();
    }
    // Describe la operación en Swagger.
    @Operation(summary = "Consultar mi cuenta")
    @SecurityRequirement(name = "bearerAuth")
    // Asocia el método HTTP y la ruta.
    @GetMapping(BASE + "/me")
    // Consulta la cuenta del JWT.
    UsuarioDTO me(@AuthenticationPrincipal Jwt jwt) { return service.obtener(UUID.fromString(jwt.getSubject())); }
    // Describe la operación en Swagger.
    @Operation(summary = "Listar cuentas como administrador")
    @SecurityRequirement(name = "bearerAuth")
    // Asocia el método HTTP y la ruta.
    @GetMapping(BASE + "/usuarios") @PreAuthorize("hasRole('ADMINISTRADOR')")
    // Consulta los registros permitidos y devuelve una lista de DTO.
    List<UsuarioDTO> listar() { return service.listar(); }
    // Describe la operación en Swagger.
    @Operation(summary = "Consultar una cuenta como administrador")
    @SecurityRequirement(name = "bearerAuth")
    // Asocia el método HTTP y la ruta.
    @GetMapping(BASE + "/usuarios/{id}") @PreAuthorize("hasRole('ADMINISTRADOR')")
    // Busca el registro por ID.
    UsuarioDTO obtener(@PathVariable UUID id) { return service.obtener(id); }
    // Describe la operación en Swagger.
    @Operation(summary = "Actualizar rol y estado de una cuenta")
    @SecurityRequirement(name = "bearerAuth")
    // Asocia el método HTTP y la ruta.
    @PutMapping(BASE + "/usuarios/{id}") @PreAuthorize("hasRole('ADMINISTRADOR')")
    // Valida y actualiza el registro.
    UsuarioDTO actualizar(@PathVariable UUID id, @Valid @RequestBody PermisosDTO dto) {
        // Entrega al servicio el UUID de la URL y los nombres de rol y estado recibidos.
        return service.actualizar(id, dto.rol(), dto.estado());
    }
    // Describe la operación en Swagger.
    @Operation(summary = "Desactivar una cuenta")
    @SecurityRequirement(name = "bearerAuth")
    // Asocia el método HTTP y la ruta.
    @DeleteMapping(BASE + "/usuarios/{id}") @PreAuthorize("hasRole('ADMINISTRADOR')")
    // Desactiva la cuenta y devuelve 204 sin cuerpo.
    ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        // Solicita la baja lógica de la cuenta y responde 204 sin eliminar físicamente su historial.
        service.desactivar(id); return ResponseEntity.noContent().build();
    }
    // Asocia el método HTTP y la ruta.
    @GetMapping("/.well-known/jwks.json")
    // Publica únicamente la clave pública en un conjunto JWK.
    Map<String, Object> jwks() { return new JWKSet(key.toPublicJWK()).toJSONObject(); }
}

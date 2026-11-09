
// Paquete de la clase.
package cl.nutrivida.ordenes.controller;

// Importa los tipos del paquete.
import java.util.*;
// Importa los tipos del paquete.
import cl.nutrivida.ordenes.dto.*;
// Importa EstadoOrden.
import cl.nutrivida.ordenes.model.EstadoOrden;
// Importa OrdenService.
import cl.nutrivida.ordenes.service.OrdenService;
// Importa Operation.
import io.swagger.v3.oas.annotations.Operation;
// Importa SecurityRequirement.
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
// Importa Tag.
import io.swagger.v3.oas.annotations.tags.Tag;
// Importa Valid.
import jakarta.validation.Valid;
// Importa NotNull.
import jakarta.validation.constraints.NotNull;
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

// Genera el constructor de dependencias.
@RestController @RequiredArgsConstructor
// Prefijo de las rutas del controlador.
@RequestMapping("/api/v1/ordenes")
@Tag(name = "Órdenes") @SecurityRequirement(name = "bearerAuth")
// Define la clase.
public class OrdenController {
    // Servicio que contiene las reglas de negocio.
    private final OrdenService service;
    // DTO de actualización: exige un EstadoOrden no nulo.
    public record EstadoDTO(@NotNull EstadoOrden estado) {}
    // Describe la operación en Swagger.
    @Operation(summary = "Crear una orden con precios validados por el catálogo")
    // Verifica los roles permitidos.
    @PostMapping @PreAuthorize("hasAnyRole('CLIENTE','ADMINISTRADOR')")
    // Crea la orden con precios del catálogo.
    ResponseEntity<OrdenDTO> crear(@Valid @RequestBody CrearOrdenDTO dto, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(201).body(service.crear(dto, jwt));
    }
    // Describe la operación en Swagger.
    @Operation(summary = "Listar órdenes; el cliente solo ve las propias")
    // Verifica los roles permitidos.
    @GetMapping @PreAuthorize("hasAnyRole('CLIENTE','ADMINISTRADOR','VENDEDOR')")
    // Devuelve la lista de registros.
    List<OrdenDTO> listar(@AuthenticationPrincipal Jwt jwt) { return service.listar(jwt); }
    // Describe la operación en Swagger.
    @Operation(summary = "Consultar el detalle de una orden")
    // Asocia el método HTTP y la ruta.
    @GetMapping("/{id}") @PreAuthorize("hasAnyRole('CLIENTE','ADMINISTRADOR','VENDEDOR')")
    // Busca el registro por ID.
    OrdenDTO obtener(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) { return service.obtener(id, jwt); }
    // Describe la operación en Swagger.
    @Operation(summary = "Actualizar estado de una orden pendiente")
    // Asocia el método HTTP y la ruta.
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMINISTRADOR')")
    // Valida y actualiza el registro.
    OrdenDTO actualizar(@PathVariable UUID id, @Valid @RequestBody EstadoDTO dto, @AuthenticationPrincipal Jwt jwt) {
        return service.cambiarEstado(id, dto.estado(), jwt);
    }
    // Describe la operación en Swagger.
    @Operation(summary = "Cancelar una orden pendiente mediante borrado lógico")
    // Asocia el método HTTP y la ruta.
    @DeleteMapping("/{id}") @PreAuthorize("hasAnyRole('CLIENTE','ADMINISTRADOR')")
    // Cancela la orden y responde 204.
    ResponseEntity<Void> cancelar(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        // Solicita al servicio cancelar la orden.
        service.cambiarEstado(id, EstadoOrden.CANCELADA, jwt); return ResponseEntity.noContent().build();
    }
}

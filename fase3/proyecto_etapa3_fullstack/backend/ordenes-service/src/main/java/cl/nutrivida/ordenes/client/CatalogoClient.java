// Contrato OpenFeign para consultar un plan por HTTP directamente al catálogo, sin Eureka.

// Paquete de la clase.
package cl.nutrivida.ordenes.client;

// Importa BigDecimal.
import java.math.BigDecimal;
// Importa FeignClient.
import org.springframework.cloud.openfeign.FeignClient;
// Importa los tipos del paquete.
import org.springframework.web.bind.annotation.*;

// OpenFeign genera un cliente HTTP llamado catalogo-service.
@FeignClient(name = "catalogo-service", url = "${app.catalogo.url:http://localhost:8083}")
// Declara el contrato del cliente HTTP.
public interface CatalogoClient {
    // Representa el JSON del catálogo: id numérico, nombre, precio decimal y activo.
    public record PlanDTO(Long id, String nombre, BigDecimal precio, Boolean activo) {}

    // Contrato de integración que debe implementar catalogo-service.
    // Asocia el método HTTP y la ruta.
    @GetMapping("${app.catalogo.ruta-planes:/api/v1/catalogo/planes}/{id}")
    // Declara la lectura del plan por id y envía Authorization en la solicitud HTTP.
    PlanDTO obtenerPlan(@PathVariable("id") Long id, @RequestHeader("Authorization") String bearer);
}

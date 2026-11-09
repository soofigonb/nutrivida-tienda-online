
// Paquete de la clase.
package cl.nutrivida.ordenes.client;

// Importa BigDecimal.
import java.math.BigDecimal;
// Importa FeignClient.
import org.springframework.cloud.openfeign.FeignClient;
// Importa los tipos del paquete.
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "catalogo-service", url = "${app.catalogo.url:http://localhost:8083}")
// Declara el contrato del cliente HTTP.
public interface CatalogoClient {
    public record PlanDTO(Long id, String nombre, BigDecimal precio, Boolean activo) {}

    // Asocia el método HTTP y la ruta.
    @GetMapping("${app.catalogo.ruta-planes:/api/v1/catalogo/planes}/{id}")
    PlanDTO obtenerPlan(@PathVariable("id") Long id, @RequestHeader("Authorization") String bearer);
}

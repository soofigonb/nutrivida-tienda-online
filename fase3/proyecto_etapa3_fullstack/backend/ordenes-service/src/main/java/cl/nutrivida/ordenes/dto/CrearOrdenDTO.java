// DTO de la API.

// Paquete de la clase.
package cl.nutrivida.ordenes.dto;

// Importa los tipos del paquete.
import java.util.*;
// Acepta idPlan de clientes anteriores; el contrato genérico utiliza idItem.
import com.fasterxml.jackson.annotation.JsonAlias;
// Importa Valid.
import jakarta.validation.Valid;
// Importa los tipos del paquete.
import jakarta.validation.constraints.*;

// Datos para crear una orden sin duplicados.
public record CrearOrdenDTO(@NotNull UUID claveIdempotencia,
    // Exige entre uno y cincuenta detalles.
    @NotEmpty @Size(max = 50) List<@NotNull @Valid ItemDTO> detalles) {
    // Cada detalle recibido exige idItem numérico positivo y cantidad entre 1 y 100.
    public record ItemDTO(@JsonAlias("idPlan") @NotNull @Positive Long idItem, @NotNull @Min(1) @Max(100) Integer cantidad) {}
}

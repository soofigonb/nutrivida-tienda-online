// Adaptación del catálogo nutricional al contrato comercial de órdenes.
package cl.nutrivida.ordenes.client;

// Importa el contrato independiente del negocio de órdenes.
import cl.nutrivida.ordenes.port.CatalogoPort;
// Permite registrar este adaptador únicamente para el proveedor NutriVida.
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
// Genera el constructor de las dependencias final.
import lombok.RequiredArgsConstructor;
// Registra el adaptador en Spring.
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.catalogo.proveedor", havingValue = "nutrivida", matchIfMissing = true)
public class CatalogoNutriVidaAdapter implements CatalogoPort {
    // El conocimiento de planes nutricionales queda encapsulado en este cliente.
    private final CatalogoClient client;

    @Override
    public ProductoDTO consultar(Long idItem, String tokenAcceso) {
        // OpenFeign obtiene el JSON del catálogo y propaga el Bearer del usuario.
        CatalogoClient.PlanDTO plan = client.obtenerPlan(idItem, "Bearer " + tokenAcceso);
        // Conserva la ausencia para que el servicio rechace el artículo no disponible.
        if (plan == null) return null;
        // Traduce el plan a un artículo comercial sin introducir datos clínicos.
        return new ProductoDTO(plan.id(), plan.nombre(), plan.precio(), plan.activo());
    }
}

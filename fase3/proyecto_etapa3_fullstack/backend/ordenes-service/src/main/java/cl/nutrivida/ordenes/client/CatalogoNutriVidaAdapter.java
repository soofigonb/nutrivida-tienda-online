package cl.nutrivida.ordenes.client;

import cl.nutrivida.ordenes.port.CatalogoPort;
import feign.FeignException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
// Genera el constructor de las dependencias final.
import lombok.RequiredArgsConstructor;
// Registra el adaptador en Spring.
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.catalogo.proveedor", havingValue = "nutrivida", matchIfMissing = true)
public class CatalogoNutriVidaAdapter implements CatalogoPort {
    private final CatalogoClient client;

    @Override
    public ProductoDTO consultar(Long idItem, String tokenAcceso) {
        CatalogoClient.PlanDTO plan;
        try {
            plan = client.obtenerPlan(idItem, "Bearer " + tokenAcceso);
        } catch (FeignException.NotFound noDisponible) {
            return null;
        }
        if (plan == null) return null;
        return new ProductoDTO(plan.id(), plan.nombre(), plan.precio(), plan.activo());
    }
}

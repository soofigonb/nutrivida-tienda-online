// Comprueba que el catálogo nutricional se traduzca al contrato comercial reutilizable.
package cl.nutrivida.ordenes.client;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CatalogoNutriVidaAdapterTest {
    @Test void traduceUnPlanYPropagaBearer() {
        CatalogoClient client = mock(CatalogoClient.class);
        when(client.obtenerPlan(7L, "Bearer acceso")).thenReturn(new CatalogoClient.PlanDTO(7L, "Consulta", new BigDecimal("35000"), true));
        var articulo = new CatalogoNutriVidaAdapter(client).consultar(7L, "acceso");
        assertEquals(7L, articulo.id());
        assertEquals(new BigDecimal("35000"), articulo.precio());
        verify(client).obtenerPlan(7L, "Bearer acceso");
    }
    @Test void conservaLaAusenciaDeUnArticulo() {
        CatalogoClient client = mock(CatalogoClient.class);
        assertNull(new CatalogoNutriVidaAdapter(client).consultar(7L, "acceso"));
    }
}

package cl.nutrivida.ordenes.client;

import java.util.UUID;
import cl.nutrivida.ordenes.exceptions.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class AgendamientoClient {
    private final RestClient cliente;

    public AgendamientoClient(@Value("${AGENDAMIENTO_SERVICE_URL:http://localhost:8085}") String url) {
        var solicitudes = new SimpleClientHttpRequestFactory();
        solicitudes.setConnectTimeout(3000);
        solicitudes.setReadTimeout(5000);
        cliente = RestClient.builder().baseUrl(url).requestFactory(solicitudes).build();
    }

    public long contarConfirmadas(UUID ordenId, String token) {
        try {
            Long cantidad = cliente.get().uri("/api/v1/agendamiento/ordenes/{id}/confirmadas", ordenId)
                    .headers(headers -> headers.setBearerAuth(token)).retrieve().body(Long.class);
            if (cantidad != null) return cantidad;
        } catch (RestClientException error) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudieron verificar las citas de la orden");
        }
        throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Agendamiento no devolvió la cantidad de citas");
    }
}

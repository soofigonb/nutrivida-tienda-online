package cl.nutrivida.agendamiento.client;

import cl.nutrivida.agendamiento.exceptions.AccesoDenegadoException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Component
public class ReservaReferencias {
    public record Item(Long idItem, String nombreItem, int cantidad, int precioUnitario) {}
    public record Orden(UUID idUsuario, String estado, List<Item> detalles) {}
    public record Profesional(String nombre) {}
    public record Paciente(Long pacienteId) {}

    private final RestClient ordenes;
    private final RestClient profesionales;
    private final RestClient pacientes;

    public ReservaReferencias(@Value("${ORDENES_SERVICE_URL:http://localhost:8086}") String ordenesUrl,
            @Value("${PROFESIONALES_SERVICE_URL:http://localhost:8084}") String profesionalesUrl,
            @Value("${PACIENTES_SERVICE_URL:http://localhost:8082}") String pacientesUrl) {
        ordenes = cliente(ordenesUrl);
        profesionales = cliente(profesionalesUrl);
        pacientes = cliente(pacientesUrl);
    }

    public Item consultarItem(UUID ordenId, Long itemId, Integer unidad, UUID usuario, Jwt jwt) {
        if (ordenId == null || itemId == null || unidad == null || unidad < 1) {
            throw new IllegalArgumentException("Identifica la unidad de la orden que quieres agendar");
        }
        Orden orden = consultar(ordenes, "/api/v1/ordenes/" + ordenId + "/referencia", Orden.class, jwt);
        if (!usuario.equals(orden.idUsuario())) {
            throw new AccesoDenegadoException("La orden pertenece a otra cuenta");
        }
        if ("CANCELADA".equals(orden.estado())) {
            throw new IllegalArgumentException("La orden está cancelada");
        }
        return orden.detalles().stream()
                .filter(item -> itemId.equals(item.idItem()) && unidad <= item.cantidad())
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("La unidad no pertenece a la orden"));
    }

    public String consultarProfesional(Long id) {
        if (id == null) throw new IllegalArgumentException("Debes seleccionar un profesional");
        return consultar(profesionales, "/api/v1/profesionales/" + id, Profesional.class, null).nombre();
    }

    public Long consultarPaciente(Jwt jwt) {
        return consultar(pacientes, "/api/v1/pacientes/me", Paciente.class, jwt).pacienteId();
    }

    private static RestClient cliente(String url) {
        var solicitudes = new SimpleClientHttpRequestFactory();
        solicitudes.setConnectTimeout(3000);
        solicitudes.setReadTimeout(5000);
        return RestClient.builder().baseUrl(url).requestFactory(solicitudes).build();
    }

    private <T> T consultar(RestClient cliente, String ruta, Class<T> tipo, Jwt jwt) {
        try {
            var solicitud = cliente.get().uri(ruta);
            if (jwt != null) solicitud.headers(headers -> headers.setBearerAuth(jwt.getTokenValue()));
            T respuesta = solicitud.retrieve().body(tipo);
            if (respuesta == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Respuesta de integración vacía");
            return respuesta;
        } catch (RestClientResponseException error) {
            int estado = error.getStatusCode().value();
            if (estado == 403 || estado == 401) throw new AccesoDenegadoException("No tienes acceso al registro relacionado");
            if (estado == 404) throw new IllegalArgumentException("Verifica que el perfil, la orden y el profesional estén disponibles");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo validar la reserva", error);
        } catch (RestClientException error) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo validar la reserva", error);
        }
    }
}

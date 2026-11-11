package cl.nutrivida.ordenes.client;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AgendamientoClientTest {
    private HttpServer servidor;
    private final AtomicReference<String> autorizacion = new AtomicReference<>();

    @BeforeEach
    void iniciarServidor() throws IOException {
        servidor = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        servidor.start();
    }

    @AfterEach
    void detenerServidor() {
        servidor.stop(0);
    }

    @Test
    void consultaLaCantidadDeCitasConElToken() throws Exception {
        var orden = UUID.randomUUID();
        responder("/api/v1/agendamiento/ordenes/" + orden + "/confirmadas", 200, "2");
        assertEquals(2L, new AgendamientoClient(url()).contarConfirmadas(orden, "prueba"));
        assertEquals("Bearer prueba", autorizacion.get());
    }

    @Test
    void informaQueAgendamientoNoEstaDisponibleSiFallaOLaRespuestaEstaVacia() {
        var orden = UUID.randomUUID();
        var cliente = new AgendamientoClient(url());
        responder("/api/v1/agendamiento/ordenes/" + orden + "/confirmadas", 503, "{}");
        assertEquals(503, assertThrows(cl.nutrivida.ordenes.exceptions.ApiException.class,
                () -> cliente.contarConfirmadas(orden, "prueba")).getStatus().value());
        servidor.removeContext("/api/v1/agendamiento/ordenes/" + orden + "/confirmadas");
        responder("/api/v1/agendamiento/ordenes/" + orden + "/confirmadas", 204, "");
        assertEquals(503, assertThrows(cl.nutrivida.ordenes.exceptions.ApiException.class,
                () -> cliente.contarConfirmadas(orden, "prueba")).getStatus().value());
    }

    private String url() {
        return "http://127.0.0.1:" + servidor.getAddress().getPort();
    }

    private void responder(String ruta, int estado, String contenido) {
        servidor.createContext(ruta, intercambio -> {
            try (intercambio) {
                autorizacion.set(intercambio.getRequestHeaders().getFirst("Authorization"));
                byte[] datos = contenido.getBytes(StandardCharsets.UTF_8);
                intercambio.getResponseHeaders().set("Content-Type", "application/json");
                intercambio.sendResponseHeaders(estado, estado == 204 ? -1 : datos.length);
                if (datos.length > 0) intercambio.getResponseBody().write(datos);
            }
        });
    }
}

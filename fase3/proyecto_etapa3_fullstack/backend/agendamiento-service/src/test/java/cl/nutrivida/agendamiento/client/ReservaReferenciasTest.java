package cl.nutrivida.agendamiento.client;

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

class ReservaReferenciasTest {
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
    void consultaLasReferenciasYVerificaLasUnidadesDeLaOrden() {
        var orden = UUID.randomUUID();
        var usuario = UUID.randomUUID();
        responder("/api/v1/ordenes/" + orden + "/referencia", 200, """
                {"idUsuario":"%s","estado":"CONFIRMADA","detalles":[
                    {"idItem":7,"nombreItem":"Consulta","cantidad":2,"precioUnitario":35000}]}
                """.formatted(usuario));
        responder("/api/v1/profesionales/3", 200, "{\"nombre\":\"Camila\"}");
        responder("/api/v1/pacientes/me", 200, "{\"pacienteId\":5}");
        var cliente = new ReservaReferencias(url(), url(), url());
        assertEquals("Camila", cliente.consultarProfesional(3L));
        assertEquals(5L, cliente.consultarPaciente(jwt()));
        assertEquals("Consulta", cliente.consultarItem(orden, 7L, 2, usuario, jwt()).nombreItem());
        assertEquals("Bearer prueba", autorizacion.get());
        assertThrows(IllegalArgumentException.class, () -> cliente.consultarItem(orden, 7L, 3, usuario, jwt()));
        assertThrows(cl.nutrivida.agendamiento.exceptions.AccesoDenegadoException.class,
                () -> cliente.consultarItem(orden, 7L, 1, UUID.randomUUID(), jwt()));
    }

    @Test
    void distingueUnaReferenciaInexistenteDeUnServicioCaido() {
        responder("/api/v1/profesionales/3", 404, "{}");
        responder("/api/v1/profesionales/4", 503, "{}");
        var cliente = new ReservaReferencias(url(), url(), url());
        assertThrows(IllegalArgumentException.class, () -> cliente.consultarProfesional(3L));
        var error = assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> cliente.consultarProfesional(4L));
        assertEquals(503, error.getStatusCode().value());
    }

    private org.springframework.security.oauth2.jwt.Jwt jwt() {
        return org.springframework.security.oauth2.jwt.Jwt.withTokenValue("prueba")
                .header("alg", "RS256").subject("cliente").build();
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

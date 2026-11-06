// Pruebas del componente.

// Paquete de la clase.
package cl.nutrivida.gateway;

// Importa los tipos del paquete.
import org.junit.jupiter.api.*;
// Importa SpringBootTest.
import org.springframework.boot.test.context.SpringBootTest;
// Importa LocalServerPort.
import org.springframework.boot.test.web.server.LocalServerPort;
// Importa MockitoBean.
import org.springframework.test.context.bean.override.mockito.MockitoBean;
// Importa DynamicPropertyRegistry.
import org.springframework.test.context.DynamicPropertyRegistry;
// Importa DynamicPropertySource.
import org.springframework.test.context.DynamicPropertySource;
// Importa WebTestClient.
import org.springframework.test.web.reactive.server.WebTestClient;
// Importa los tipos del paquete.
import org.springframework.security.oauth2.jwt.*;
// Importa Mono.
import reactor.core.publisher.Mono;
// Importa HttpServer.
import com.sun.net.httpserver.HttpServer;
// Importa InetSocketAddress.
import java.net.InetSocketAddress;
// Importa List.
import java.util.List;
// Importa when.
import static org.mockito.Mockito.when;

// Arranca el gateway real con un puerto HTTP libre.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
// Define la clase.
class ApiGatewayApplicationTests {
    // Mantiene la referencia compartida al servidor simulado para configurar sus URLs y detenerlo al finalizar.
    static final HttpServer backend;
    // Prepara el servidor simulado.
    static {
        // Intenta preparar el recurso.
        try {
            // Crea un servidor HTTP solo en la interfaz local.
            backend = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            // Configura el servidor destino simulado para contestar las solicitudes.
            backend.createContext("/", exchange -> {
                // Convierte la ruta recibida a bytes UTF-8 para devolverla y comprobar que el gateway no la alteró.
                byte[] body = exchange.getRequestURI().getPath().getBytes(java.nio.charset.StandardCharsets.UTF_8);
                // El servidor simulado responde 200 e indica la longitud del cuerpo.
                exchange.sendResponseHeaders(200, body.length);
                // Escribe en la respuesta del servidor simulado los bytes preparados con la ruta recibida.
                exchange.getResponseBody().write(body);
                // Cierra el intercambio HTTP del servidor simulado una vez enviada la respuesta.
                exchange.close();
            });
            // Inicia el servidor HTTP simulado antes de que el gateway intente comunicarse con él.
            backend.start();
        // Detiene la preparación del conjunto de pruebas si no pudo crear su servidor HTTP temporal.
        } catch (Exception e) { throw new ExceptionInInitializerError(e); }
    }
    // Entrega a Spring las direcciones temporales de los servicios simulados antes de arrancar el gateway.
    @DynamicPropertySource
    // Define el caso o la preparación rutas.
    static void rutas(DynamicPropertyRegistry registry) {
        // Recorre los seis nombres de servicios para redirigirlos al mismo servidor simulado durante estas pruebas.
        for (String service : List.of("AUTENTICACION", "PACIENTES", "CATALOGO", "PROFESIONALES", "AGENDAMIENTO", "ORDENES"))
            // Sobrescribe la URL de cada servicio destino con el servidor HTTP local de prueba.
            registry.add(service + "_SERVICE_URL", () -> "http://127.0.0.1:" + backend.getAddress().getPort());
    }
    // Guarda el puerto libre elegido para poder construir las URLs de las solicitudes HTTP de prueba.
    @LocalServerPort int port;
    // Sustituye en el contexto del gateway el decoder JWT por un mock.
    @MockitoBean ReactiveJwtDecoder decoder;
    // Conserva el cliente que enviará solicitudes HTTP al gateway de prueba.
    WebTestClient client;
    // Prepara objetos y respuestas antes de cada caso para mantener independientes las pruebas.
    @BeforeEach void preparar() {
        // Construye el cliente HTTP apuntando al puerto real y aleatorio del gateway de prueba.
        client = WebTestClient.bindToServer().baseUrl("http://localhost:" + port).build();
        // Prepara JWT simulados para los tres roles que luego se usan para comprobar las reglas de autorización.
        for (String rol : List.of("VENDEDOR", "CLIENTE", "ADMINISTRADOR")) {
            // Construye un JWT de prueba con sujeto y roles controlados.
            Jwt jwt = Jwt.withTokenValue(rol).header("alg", "RS256").subject("usuario").claim("roles", List.of(rol)).build();
            // Respuesta simulada.
            when(decoder.decode(rol)).thenReturn(Mono.just(jwt));
        }
    }
    // Cierra el servidor HTTP simulado después del último caso para liberar su puerto.
    @AfterAll static void cerrar() { backend.stop(0); }
    // Caso de prueba.
    @Test void rechazaOrdenesSinSesion() {
        // Comprueba la respuesta HTTP.
        client.get().uri("/api/v1/ordenes").exchange().expectStatus().isUnauthorized();
    }
    // Caso de prueba.
    @Test void vendedorPuedeLeerOrdenesYSeConservaRuta() {
        // Comprueba la respuesta HTTP.
        client.get().uri("/api/v1/ordenes/123").headers(h -> h.setBearerAuth("VENDEDOR"))
            // Comprueba la respuesta HTTP.
            .exchange().expectStatus().isOk().expectBody(String.class).isEqualTo("/api/v1/ordenes/123");
    }
    // Caso de prueba.
    @Test void vendedorNoPuedeCrearOrdenesNiLeerPacientes() {
        // Comprueba la respuesta HTTP.
        client.post().uri("/api/v1/ordenes").headers(h -> h.setBearerAuth("VENDEDOR")).exchange().expectStatus().isForbidden();
        // Comprueba la respuesta HTTP.
        client.get().uri("/api/v1/pacientes").headers(h -> h.setBearerAuth("VENDEDOR")).exchange().expectStatus().isForbidden();
    }
    // Caso de prueba.
    @Test void clienteNoPuedeAdministrarCuentas() {
        // Comprueba la respuesta HTTP.
        client.get().uri("/api/v1/autenticacion/usuarios").headers(h -> h.setBearerAuth("CLIENTE")).exchange().expectStatus().isForbidden();
    }
    // Caso de prueba.
    @Test void administradorPuedeConsultarCuentas() {
        // Comprueba la respuesta HTTP.
        client.get().uri("/api/v1/autenticacion/usuarios").headers(h -> h.setBearerAuth("ADMINISTRADOR")).exchange().expectStatus().isOk();
    }
    // Caso de prueba.
    @Test void catalogoPublicoYLoginNoExigenToken() {
        // Comprueba la respuesta HTTP.
        client.get().uri("/api/v1/catalogo/planes").exchange().expectStatus().isOk();
        // Comprueba la respuesta HTTP.
        client.post().uri("/api/v1/autenticacion/web/login").exchange().expectStatus().isOk();
    }
    // Caso de prueba.
    @Test void corsPermiteCredencialesSoloDesdeFrontendConfigurado() {
        // Comprueba la respuesta HTTP.
        client.options().uri("/api/v1/ordenes").header("Origin", "http://localhost:5173")
            // Comprueba la respuesta HTTP.
            .header("Access-Control-Request-Method", "GET").exchange().expectStatus().isOk()
            // Comprueba la respuesta HTTP.
            .expectHeader().valueEquals("Access-Control-Allow-Credentials", "true")
            // Comprueba la respuesta HTTP.
            .expectHeader().valueEquals("Access-Control-Allow-Origin", "http://localhost:5173");
        // Comprueba la respuesta HTTP.
        client.options().uri("/api/v1/ordenes").header("Origin", "https://externo.example")
            // Comprueba la respuesta HTTP.
            .header("Access-Control-Request-Method", "GET").exchange().expectStatus().isForbidden();
    }
}

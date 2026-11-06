// Configura el acceso por rutas y roles del gateway reactivo, la verificación JWT y CORS.

// Paquete de la clase.
package cl.nutrivida.gateway.config;

// Importa List.
import java.util.List;
// Importa Value.
import org.springframework.beans.factory.annotation.Value;
// Importa los tipos del paquete.
import org.springframework.context.annotation.*;
// Importa HttpMethod.
import org.springframework.http.HttpMethod;
// Importa EnableWebFluxSecurity.
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
// Importa ServerHttpSecurity.
import org.springframework.security.config.web.server.ServerHttpSecurity;
// Importa los tipos del paquete.
import org.springframework.security.oauth2.jwt.*;
// Importa los tipos del paquete.
import org.springframework.security.oauth2.server.resource.authentication.*;
// Importa SecurityWebFilterChain.
import org.springframework.security.web.server.SecurityWebFilterChain;
// Importa CorsConfiguration.
import org.springframework.web.cors.CorsConfiguration;
// Importa los tipos del paquete.
import org.springframework.web.cors.reactive.*;

// Configuración de Spring.
@Configuration @EnableWebFluxSecurity
// Define la clase.
public class SecurityConfig {
    // Registra el componente en Spring.
    @Bean
    // Declara el verificador JWT reactivo y recibe la URL JWKS desde JWT_JWK_SET_URI.
    ReactiveJwtDecoder jwtDecoder(@Value("${JWT_JWK_SET_URI:http://localhost:8081/.well-known/jwks.json}") String jwks,
                                  // Lee la propiedad de configuración.
                                  @Value("${JWT_ISSUER:http://localhost:8081}") String issuer) {
        // Crea el verificador de firma usando el endpoint JWKS de autenticación.
        NimbusReactiveJwtDecoder decoder = NimbusReactiveJwtDecoder.withJwkSetUri(jwks).build();
        // Además de la firma, valida los tiempos del JWT y que su campo iss coincida con el emisor configurado.
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));
        // Devuelve el verificador para que Spring lo utilice cuando llegue una solicitud con JWT.
        return decoder;
    }
    // Registra el componente en Spring.
    @Bean
    // Construye las reglas CORS que permitirán al navegador llamar al gateway desde el frontend autorizado.
    CorsConfigurationSource corsConfigurationSource(@Value("${FRONTEND_URL:http://localhost:5173}") String frontend) {
        // Crea las reglas que indican qué solicitudes de otros orígenes puede realizar el navegador.
        CorsConfiguration cors = new CorsConfiguration();
        // Permite únicamente el origen exacto de FRONTEND_URL, incluyendo protocolo, servidor y puerto.
        cors.setAllowedOrigins(List.of(frontend));
        // Autoriza estos métodos HTTP para las solicitudes del navegador.
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // Permite enviar el JWT, indicar el formato JSON y solicitar el formato de respuesta.
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        // Permite al navegador incluir cookies cuando fetch usa credentials: include.
        cors.setAllowCredentials(true);
        // Crea el registro que asocia rutas del gateway con una configuración CORS.
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplica la misma configuración CORS a todas las rutas del gateway.
        source.registerCorsConfiguration("/**", cors);
        // Entrega a Spring Security el registro de reglas CORS.
        return source;
    }
    // Registra el componente en Spring.
    @Bean
    // Construye los filtros reactivos de seguridad del gateway.
    SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        // Crea el adaptador que convierte el contenido del JWT en permisos reconocidos por Spring Security.
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        // Lee el campo roles y antepone ROLE_ a cada valor.
        roles.setAuthoritiesClaimName("roles"); roles.setAuthorityPrefix("ROLE_");
        // Crea el adaptador que representa al usuario autenticado a partir de un JWT válido.
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        // Conecta el lector de roles con el adaptador del usuario autenticado.
        converter.setJwtGrantedAuthoritiesConverter(roles);
        // Configura la API con Bearer sin el filtro CSRF general y activa CORS con el bean definido arriba.
        return http.csrf(c -> c.disable()).cors(c -> {})
            // Inicia las reglas de acceso del gateway reactivo.
            .authorizeExchange(a -> a
                // Permite las solicitudes CORS previas.
                .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Permite registrar cuentas, iniciar sesión, renovar y cerrar sesión sin exigir un JWT de acceso previo.
                .pathMatchers(HttpMethod.POST, "/api/v1/autenticacion/registro", "/api/v1/autenticacion/login", "/api/v1/autenticacion/renovar", "/api/v1/autenticacion/logout", "/api/v1/autenticacion/web/**").permitAll()
                // Permite la consulta pública del catálogo y de profesionales.
                .pathMatchers(HttpMethod.GET, "/api/v1/catalogo/**", "/api/v1/profesionales/**").permitAll()
                // Reserva las rutas de gestión de cuentas para ADMINISTRADOR.
                .pathMatchers("/api/v1/autenticacion/usuarios/**").hasRole("ADMINISTRADOR")
                // Exige un JWT válido para consultar la cuenta actual.
                .pathMatchers("/api/v1/autenticacion/me").authenticated()
                // Permite consultar órdenes a los tres roles.
                .pathMatchers(HttpMethod.GET, "/api/v1/ordenes/**").hasAnyRole("ADMINISTRADOR", "VENDEDOR", "CLIENTE")
                // Permite intentar operaciones de órdenes a administrador y cliente.
                .pathMatchers("/api/v1/ordenes/**").hasAnyRole("ADMINISTRADOR", "CLIENTE")
                // Reserva la escritura sobre catálogo y profesionales para ADMINISTRADOR.
                .pathMatchers("/api/v1/catalogo/**", "/api/v1/profesionales/**").hasRole("ADMINISTRADOR")
                // Solo deja pasar a administrador y cliente hacia pacientes y agendamiento.
                .pathMatchers("/api/v1/pacientes/**", "/api/v1/agendamiento/**").hasAnyRole("ADMINISTRADOR", "CLIENTE")
                // Rechaza cualquier ruta sin regla explícita para evitar publicar accidentalmente un endpoint nuevo.
                .anyExchange().denyAll())
            // Activa JWT en WebFlux.
            .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(new ReactiveJwtAuthenticationConverterAdapter(converter))))
            // Construye la configuración.
            .build();
    }
}

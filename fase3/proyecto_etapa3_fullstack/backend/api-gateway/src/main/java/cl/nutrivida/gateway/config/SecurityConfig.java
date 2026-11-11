
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
    ReactiveJwtDecoder jwtDecoder(@Value("${JWT_JWK_SET_URI:http://localhost:8081/.well-known/jwks.json}") String jwks,
                                  // Lee la propiedad de configuración.
                                  @Value("${JWT_ISSUER:http://localhost:8081}") String issuer) {
        NimbusReactiveJwtDecoder decoder = NimbusReactiveJwtDecoder.withJwkSetUri(jwks).build();
        // Valida emisor y vigencia del JWT.
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));
        return decoder;
    }
    // Registra el componente en Spring.
    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${FRONTEND_URL:http://localhost:5173}") String frontend) {
        CorsConfiguration cors = new CorsConfiguration();
        // Autoriza solo FRONTEND_URL.
        cors.setAllowedOrigins(List.of(frontend));
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        // Permite enviar cookies.
        cors.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        // Entrega a Spring Security el registro de reglas CORS.
        return source;
    }
    // Registra el componente en Spring.
    @Bean
    SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        // Lee el campo roles y antepone ROLE_ a cada valor.
        roles.setAuthoritiesClaimName("roles"); roles.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(roles);
        return http.csrf(c -> c.disable()).cors(c -> {})
            // Inicia las reglas de acceso del gateway reactivo.
            .authorizeExchange(a -> a
                // Permite las solicitudes CORS previas.
                .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .pathMatchers(HttpMethod.POST, "/api/v1/autenticacion/registro", "/api/v1/autenticacion/login", "/api/v1/autenticacion/renovar", "/api/v1/autenticacion/logout", "/api/v1/autenticacion/web/**").permitAll()
                .pathMatchers(HttpMethod.GET, "/api/v1/catalogo/**", "/api/v1/profesionales/**").permitAll()
                .pathMatchers(HttpMethod.GET, "/api/v1/agendamiento/disponibilidad").permitAll()
                .pathMatchers("/api/v1/autenticacion/usuarios/**").hasRole("ADMINISTRADOR")
                // Exige un JWT válido para consultar la cuenta actual.
                .pathMatchers("/api/v1/autenticacion/me").authenticated()
                // Permite consultar órdenes a los tres roles.
                .pathMatchers(HttpMethod.GET, "/api/v1/ordenes/**").hasAnyRole("ADMINISTRADOR", "VENDEDOR", "CLIENTE")
                .pathMatchers("/api/v1/ordenes/**").hasAnyRole("ADMINISTRADOR", "CLIENTE")
                .pathMatchers("/api/v1/catalogo/**", "/api/v1/profesionales/**").hasRole("ADMINISTRADOR")
                .pathMatchers("/api/v1/pacientes", "/api/v1/pacientes/").hasRole("ADMINISTRADOR")
                .pathMatchers(HttpMethod.DELETE, "/api/v1/pacientes/**").hasRole("ADMINISTRADOR")
                .pathMatchers("/api/v1/pacientes/**", "/api/v1/agendamiento/**").hasAnyRole("ADMINISTRADOR", "CLIENTE")
                // Bloquea rutas sin regla.
                .anyExchange().denyAll())
            // Activa JWT en WebFlux.
            .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(new ReactiveJwtAuthenticationConverterAdapter(converter))))
            // Construye la configuración.
            .build();
    }
}

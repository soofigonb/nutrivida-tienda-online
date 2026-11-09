
// Paquete de la clase.
package cl.nutrivida.ordenes.config;

// Importa Value.
import org.springframework.beans.factory.annotation.Value;
// Importa los tipos del paquete.
import org.springframework.context.annotation.*;
// Importa EnableMethodSecurity.
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
// Importa HttpSecurity.
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// Importa SessionCreationPolicy.
import org.springframework.security.config.http.SessionCreationPolicy;
// Importa los tipos del paquete.
import org.springframework.security.oauth2.jwt.*;
// Importa los tipos del paquete.
import org.springframework.security.oauth2.server.resource.authentication.*;
// Importa SecurityFilterChain.
import org.springframework.security.web.SecurityFilterChain;

// Configuración de Spring.
@Configuration @EnableMethodSecurity
// Define la clase.
public class SecurityConfig {
    // Registra el componente en Spring.
    @Bean
    JwtDecoder jwtDecoder(@Value("${app.jwt.jwk-set-uri:http://localhost:8081/.well-known/jwks.json}") String jwks,
                          // Lee la propiedad de configuración.
                          @Value("${app.jwt.issuer:http://localhost:8081}") String issuer) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwks).build();
        // Valida emisor y vigencia del JWT.
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));
        return decoder;
    }
    // Registra el componente en Spring.
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        // Lee el campo roles y antepone ROLE_ a cada valor.
        roles.setAuthoritiesClaimName("roles"); roles.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(roles);
        // Configura la seguridad HTTP.
        return http.csrf(c -> c.disable())
            // Sin sesiones HTTP en el servidor.
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Permite consultar OpenAPI y Swagger sin JWT.
            .authorizeHttpRequests(a -> a.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/doc/swagger-ui.html", "/doc/swagger-ui/**").permitAll().anyRequest().authenticated())
            .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(converter))).build();
    }
}

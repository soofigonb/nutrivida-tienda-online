// Configura la verificación JWT, la conversión de roles y los filtros HTTP del servicio.

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
    // Declara el verificador JWT y recibe la URL de claves públicas desde app.jwt.jwk-set-uri.
    JwtDecoder jwtDecoder(@Value("${app.jwt.jwk-set-uri:http://localhost:8081/.well-known/jwks.json}") String jwks,
                          // Lee la propiedad de configuración.
                          @Value("${app.jwt.issuer:http://localhost:8081}") String issuer) {
        // Crea el verificador de firma usando el endpoint JWKS de autenticación.
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwks).build();
        // Además de la firma, valida los tiempos del JWT y que su campo iss coincida con el emisor configurado.
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));
        // Devuelve el verificador para que Spring lo utilice cuando llegue una solicitud con JWT.
        return decoder;
    }
    // Registra el componente en Spring.
    @Bean
    // Construye los filtros de seguridad servlet que se aplican a todas las solicitudes del servicio.
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Crea el adaptador que convierte el contenido del JWT en permisos reconocidos por Spring Security.
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        // Lee el campo roles y antepone ROLE_ a cada valor.
        roles.setAuthoritiesClaimName("roles"); roles.setAuthorityPrefix("ROLE_");
        // Crea el adaptador que representa al usuario autenticado a partir de un JWT válido.
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        // Conecta el lector de roles con el adaptador del usuario autenticado.
        converter.setJwtGrantedAuthoritiesConverter(roles);
        // Configura la seguridad HTTP.
        return http.csrf(c -> c.disable())
            // Sin sesiones HTTP en el servidor.
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Permite consultar OpenAPI y Swagger sin JWT.
            // Incluye los recursos de la interfaz bajo el prefijo personalizado /doc/.
            .authorizeHttpRequests(a -> a.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/doc/swagger-ui.html", "/doc/swagger-ui/**").permitAll().anyRequest().authenticated())
            // Activa Authorization: Bearer, verifica el JWT con el decoder y convierte roles a permisos.
            .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(converter))).build();
    }
}

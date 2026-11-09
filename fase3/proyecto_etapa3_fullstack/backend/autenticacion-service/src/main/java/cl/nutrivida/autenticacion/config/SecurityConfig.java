
// Paquete de la clase.
package cl.nutrivida.autenticacion.config;

// Importa los tipos del paquete.
import org.springframework.context.annotation.*;
// Importa HttpMethod.
import org.springframework.http.HttpMethod;
// Importa EnableMethodSecurity.
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
// Importa HttpSecurity.
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// Importa SessionCreationPolicy.
import org.springframework.security.config.http.SessionCreationPolicy;
// Importa BCryptPasswordEncoder.
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// Importa PasswordEncoder.
import org.springframework.security.crypto.password.PasswordEncoder;
// Importa los tipos del paquete.
import org.springframework.security.oauth2.server.resource.authentication.*;
// Importa SecurityFilterChain.
import org.springframework.security.web.SecurityFilterChain;

// Configuración de Spring.
@Configuration
@EnableMethodSecurity
// Define la clase.
public class SecurityConfig {
    // Registra el componente en Spring.
    @Bean
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    // Registra el componente en Spring.
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        roles.setAuthoritiesClaimName("roles");
        roles.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(roles);
        // Configura la seguridad HTTP.
        return http.csrf(c -> c.disable())
            // Sin sesiones HTTP en el servidor.
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Inicia las reglas de acceso HTTP.
            .authorizeHttpRequests(a -> a
                .requestMatchers(HttpMethod.POST, "/api/v1/autenticacion/registro", "/api/v1/autenticacion/login", "/api/v1/autenticacion/renovar", "/api/v1/autenticacion/logout", "/api/v1/autenticacion/web/**").permitAll()
                // Incluye los recursos de Swagger.
                .requestMatchers("/.well-known/jwks.json", "/v3/api-docs/**", "/swagger-ui/**", "/doc/swagger-ui.html", "/doc/swagger-ui/**").permitAll()
                .anyRequest().authenticated())
            // Valida el JWT y obtiene los roles.
            .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(converter)))
            // Construye la configuración.
            .build();
    }
}

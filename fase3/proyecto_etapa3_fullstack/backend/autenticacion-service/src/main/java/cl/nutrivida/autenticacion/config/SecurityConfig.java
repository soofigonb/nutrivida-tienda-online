// Configura la verificación JWT, la conversión de roles y los filtros HTTP del servicio.

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
// Habilita @PreAuthorize para comprobar permisos también dentro del servicio.
@EnableMethodSecurity
// Define la clase.
public class SecurityConfig {
    // Registra el componente en Spring.
    @Bean
    // Entrega la implementación BCrypt utilizada para hashes de contraseñas.
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    // Registra el componente en Spring.
    @Bean
    // Construye los filtros de seguridad servlet que se aplican a todas las solicitudes del servicio.
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Crea el adaptador que convierte el contenido del JWT en permisos reconocidos por Spring Security.
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        // Indica que los permisos se leen del campo roles del JWT, en vez del campo scope utilizado por defecto.
        roles.setAuthoritiesClaimName("roles");
        // Transforma ADMINISTRADOR en ROLE_ADMINISTRADOR, el formato que espera hasRole.
        roles.setAuthorityPrefix("ROLE_");
        // Crea el adaptador que representa al usuario autenticado a partir de un JWT válido.
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        // Conecta el lector de roles con el adaptador del usuario autenticado.
        converter.setJwtGrantedAuthoritiesConverter(roles);
        // Configura la seguridad HTTP.
        return http.csrf(c -> c.disable())
            // Sin sesiones HTTP en el servidor.
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Inicia las reglas de acceso HTTP.
            .authorizeHttpRequests(a -> a
                // Permite registrar cuentas, iniciar sesión, renovar y cerrar sesión sin exigir un JWT de acceso previo.
                .requestMatchers(HttpMethod.POST, "/api/v1/autenticacion/registro", "/api/v1/autenticacion/login", "/api/v1/autenticacion/renovar", "/api/v1/autenticacion/logout", "/api/v1/autenticacion/web/**").permitAll()
                // Publica la clave pública JWKS y las rutas de Swagger/OpenAPI.
                // La ruta personalizada de Swagger también redirige sus recursos bajo /doc/swagger-ui/.
                .requestMatchers("/.well-known/jwks.json", "/v3/api-docs/**", "/swagger-ui/**", "/doc/swagger-ui.html", "/doc/swagger-ui/**").permitAll()
                // Exige autenticación a cualquier solicitud que no haya sido permitida explícitamente arriba.
                .anyRequest().authenticated())
            // Valida el JWT y obtiene los roles.
            .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(converter)))
            // Construye la configuración.
            .build();
    }
}

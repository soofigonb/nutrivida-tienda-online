
// Paquete de la clase.
package cl.nutrivida.autenticacion.config;

// Importa RSAPublicKey.
import java.security.interfaces.RSAPublicKey;
// Importa RSAPrivateKey.
import java.security.interfaces.RSAPrivateKey;
// Importa los tipos del paquete.
import com.nimbusds.jose.jwk.*;
// Importa ImmutableJWKSet.
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
// Importa Value.
import org.springframework.beans.factory.annotation.Value;
// Importa los tipos del paquete.
import org.springframework.context.annotation.*;
// Importa los tipos del paquete.
import org.springframework.security.oauth2.jwt.*;

// Configuración de Spring.
@Configuration
// Define la clase.
public class JwtConfig {
    // Registra el componente en Spring.
    @Bean
    RSAKey rsaKey(@Value("${app.jwt.public-key}") RSAPublicKey publica,
                  // Lee la propiedad de configuración.
                  @Value("${app.jwt.private-key}") RSAPrivateKey privada) {
        // Reúne las claves pública y privada en un objeto JWK.
        return new RSAKey.Builder(publica).privateKey(privada).keyID("nutrivida-rsa-1").build();
    }

    // Registra el componente en Spring.
    @Bean
    // Prepara el componente que firma los JWT.
    JwtEncoder jwtEncoder(RSAKey key) {
        return new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(key)));
    }

    // Registra el componente en Spring.
    @Bean
    JwtDecoder jwtDecoder(RSAKey key, @Value("${app.jwt.issuer}") String issuer) throws Exception {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withPublicKey(key.toRSAPublicKey()).build();
        // Valida emisor y vigencia del JWT.
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));
        return decoder;
    }
}

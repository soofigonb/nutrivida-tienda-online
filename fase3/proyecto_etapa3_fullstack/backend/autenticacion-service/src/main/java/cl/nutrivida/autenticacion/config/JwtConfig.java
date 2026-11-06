// Crea los componentes que cargan las claves RSA, firman JWT y verifican el emisor y la vigencia.

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
    // Declara el bean rsaKey y recibe la clave pública desde app.jwt.public-key.
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
        // Crea el firmador JWT de Nimbus usando el conjunto de claves RSA.
        return new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(key)));
    }

    // Registra el componente en Spring.
    @Bean
    // Prepara el componente que verifica los JWT y comprueba su emisor y vigencia.
    JwtDecoder jwtDecoder(RSAKey key, @Value("${app.jwt.issuer}") String issuer) throws Exception {
        // Prepara un verificador de firma con la clave pública RSA.
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withPublicKey(key.toRSAPublicKey()).build();
        // Además de la firma, valida los tiempos del JWT y que su campo iss coincida con el emisor configurado.
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));
        // Devuelve el verificador para que Spring lo utilice cuando llegue una solicitud con JWT.
        return decoder;
    }
}

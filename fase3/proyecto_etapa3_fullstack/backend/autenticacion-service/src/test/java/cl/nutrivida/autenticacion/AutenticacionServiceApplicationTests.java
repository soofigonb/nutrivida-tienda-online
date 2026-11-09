// Pruebas del componente.

// Paquete de la clase.
package cl.nutrivida.autenticacion;

// Importa Test.
import org.junit.jupiter.api.Test;
// Importa KeyPairGenerator.
import java.security.KeyPairGenerator;
// Importa Instant.
import java.time.Instant;
// Importa los tipos del paquete.
import com.nimbusds.jose.jwk.*;
// Importa ImmutableJWKSet.
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
// Importa los tipos del paquete.
import org.springframework.security.oauth2.jwt.*;
// Importa los tipos del paquete.
import static org.junit.jupiter.api.Assertions.*;

// Define la clase.
class AutenticacionServiceApplicationTests {

	// Caso de prueba.
	@Test
	void firmaRsaYValidaEmisorYExpiracion() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        var pair = generator.generateKeyPair();
        // Empieza la representación JWK de las claves temporales.
        RSAKey key = new RSAKey.Builder((java.security.interfaces.RSAPublicKey) pair.getPublic())
            .privateKey(pair.getPrivate()).keyID("test").build();
        JwtEncoder encoder = new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(key)));
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withPublicKey(key.toRSAPublicKey()).build();
        // Configura la validación del emisor.
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer("nutrivida-test"));
        JwtClaimsSet valido = JwtClaimsSet.builder().issuer("nutrivida-test").subject("cliente")
            .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(300)).build();
        String token = encoder.encode(JwtEncoderParameters.from(valido)).getTokenValue();
        // Comprueba el resultado.
        assertEquals("cliente", decoder.decode(token).getSubject());
        JwtClaimsSet vencido = JwtClaimsSet.builder().issuer("nutrivida-test").subject("cliente")
            .issuedAt(Instant.now().minusSeconds(600)).expiresAt(Instant.now().minusSeconds(120)).build();
        // Comprueba la excepción esperada.
        assertThrows(JwtValidationException.class, () -> decoder.decode(encoder.encode(JwtEncoderParameters.from(vencido)).getTokenValue()));
        // Comprueba el rechazo de otro emisor.
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer("otro-emisor"));
        // Comprueba la excepción esperada.
        assertThrows(JwtValidationException.class, () -> decoder.decode(token));
	}

}

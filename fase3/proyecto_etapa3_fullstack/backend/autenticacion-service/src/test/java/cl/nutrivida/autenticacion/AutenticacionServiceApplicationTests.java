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
	// Define el caso o la preparación firmaRsaYValidaEmisorYExpiracion.
	void firmaRsaYValidaEmisorYExpiracion() throws Exception {
        // Solicita al proveedor criptográfico de Java un generador de claves RSA para esta prueba.
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        // Configura el par RSA temporal con una longitud de 2048 bits.
        generator.initialize(2048);
        // Genera el par RSA de prueba en memoria, sin consultar ni cambiar las claves del proyecto.
        var pair = generator.generateKeyPair();
        // Empieza la representación JWK de las claves temporales.
        RSAKey key = new RSAKey.Builder((java.security.interfaces.RSAPublicKey) pair.getPublic())
            // Añade la clave privada temporal y un identificador test para completar el JWK de la prueba.
            .privateKey(pair.getPrivate()).keyID("test").build();
        // Prepara un firmador real con las claves temporales para comprobar el ciclo de firma y verificación.
        JwtEncoder encoder = new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(key)));
        // Prepara un verificador de firma con la clave pública RSA.
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withPublicKey(key.toRSAPublicKey()).build();
        // Configura la validación del emisor.
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer("nutrivida-test"));
        // Prepara claims para un token válido con emisor y sujeto conocidos.
        JwtClaimsSet valido = JwtClaimsSet.builder().issuer("nutrivida-test").subject("cliente")
            // Fija las fechas de emisión y expiración relativas al reloj actual.
            .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(300)).build();
        // Firma realmente el token con RSA y conserva el texto resultante para verificarlo después.
        String token = encoder.encode(JwtEncoderParameters.from(valido)).getTokenValue();
        // Comprueba el resultado.
        assertEquals("cliente", decoder.decode(token).getSubject());
        // Prepara claims para un token vencido y poder comprobar que el decoder lo rechaza.
        JwtClaimsSet vencido = JwtClaimsSet.builder().issuer("nutrivida-test").subject("cliente")
            // Fija las fechas de emisión y expiración relativas al reloj actual.
            .issuedAt(Instant.now().minusSeconds(600)).expiresAt(Instant.now().minusSeconds(120)).build();
        // Comprueba la excepción esperada.
        assertThrows(JwtValidationException.class, () -> decoder.decode(encoder.encode(JwtEncoderParameters.from(vencido)).getTokenValue()));
        // Comprueba el rechazo de otro emisor.
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer("otro-emisor"));
        // Comprueba la excepción esperada.
        assertThrows(JwtValidationException.class, () -> decoder.decode(token));
	}

}

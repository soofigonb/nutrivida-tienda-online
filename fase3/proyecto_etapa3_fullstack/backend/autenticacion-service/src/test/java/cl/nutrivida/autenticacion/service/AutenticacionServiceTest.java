// Pruebas del componente.

// Paquete de la clase.
package cl.nutrivida.autenticacion.service;

// Importa los tipos del paquete.
import java.util.*;
// Importa los tipos del paquete.
import cl.nutrivida.autenticacion.dto.*;
// Importa los tipos del paquete.
import cl.nutrivida.autenticacion.model.*;
// Importa los tipos del paquete.
import cl.nutrivida.autenticacion.repository.*;
// Importa ApiException.
import cl.nutrivida.autenticacion.exceptions.ApiException;
// Importa los tipos del paquete.
import org.junit.jupiter.api.*;
// Importa ExtendWith.
import org.junit.jupiter.api.extension.ExtendWith;
// Importa los tipos del paquete.
import org.mockito.*;
// Importa MockitoExtension.
import org.mockito.junit.jupiter.MockitoExtension;
// Importa BCryptPasswordEncoder.
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// Importa JwtEncoder.
import org.springframework.security.oauth2.jwt.JwtEncoder;
// Importa los tipos del paquete.
import static org.junit.jupiter.api.Assertions.*;
// Importa los tipos del paquete.
import static org.mockito.Mockito.*;

// Activa MockitoExtension, que crea y gestiona los objetos marcados con @Mock.
@ExtendWith(MockitoExtension.class)
// Define la clase.
class AutenticacionServiceTest {
    @Test void permiteOtraPoliticaDeRegistroSinDatosClinicos() {
        // Otro proyecto puede configurar un rol inicial que exista en su propia base.
        org.springframework.test.util.ReflectionTestUtils.setField(service, "rolRegistro", "MIEMBRO");
        Rol rol = new Rol(); rol.setNombre("MIEMBRO");
        EstadoUsuario estado = new EstadoUsuario(); estado.setNombre("ACTIVO");
        when(roles.findByNombre("MIEMBRO")).thenReturn(Optional.of(rol));
        when(estados.findByNombre("ACTIVO")).thenReturn(Optional.of(estado));
        when(usuarios.save(any())).thenAnswer(i -> i.getArgument(0));
        assertEquals("MIEMBRO", service.registrar(new RegistroDTO("a@ejemplo.cl", "Clave123")).rol());
        verify(roles, never()).findByNombre("CLIENTE");
    }
    // Simula la dependencia.
    @Mock UsuarioRepository usuarios;
    // Simula la dependencia.
    @Mock RolRepository roles;
    // Simula la dependencia.
    @Mock EstadoUsuarioRepository estados;
    // Simula la dependencia.
    @Mock TokenRenovacionRepository tokens;
    // Simula la dependencia.
    @Mock JwtEncoder encoder;
    // Servicio que se prueba.
    AutenticacionService service;
    // Prepara objetos y respuestas antes de cada caso para mantener independientes las pruebas.
    @BeforeEach void preparar() {
        // Prepara el servicio para la prueba.
        service = new AutenticacionService(usuarios, roles, estados, tokens, new UsuarioMapper(), new BCryptPasswordEncoder(), encoder);
    }
    // Caso de prueba.
    @Test void registroNormalizaCorreoYGuardaSoloHashComoCliente() {
        // Prepara un rol de prueba y le asigna el nombre que el caso necesita.
        Rol rol = new Rol(); rol.setNombre("CLIENTE");
        // Prepara un estado de cuenta ficticio para controlar si el usuario está activo en este caso.
        EstadoUsuario estado = new EstadoUsuario(); estado.setNombre("ACTIVO");
        // Respuesta simulada.
        when(roles.findByNombre("CLIENTE")).thenReturn(Optional.of(rol));
        // Respuesta simulada.
        when(estados.findByNombre("ACTIVO")).thenReturn(Optional.of(estado));
        // Respuesta simulada.
        when(usuarios.save(any())).thenAnswer(i -> i.getArgument(0));
        // Comprueba la normalización del correo.
        UsuarioDTO resultado = service.registrar(new RegistroDTO(" CLIENTE@DUOC.CL ", "UnaClave123"));
        // Crea un capturador para inspeccionar el valor que el servicio intenta enviar a la dependencia simulada.
        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        // Verifica las llamadas esperadas.
        verify(usuarios).save(captor.capture());
        // Comprueba el resultado.
        assertEquals("cliente@duoc.cl", resultado.correo());
        // Comprueba el resultado.
        assertEquals("CLIENTE", resultado.rol());
        // Verifica la condición.
        assertTrue(new BCryptPasswordEncoder().matches("UnaClave123", captor.getValue().getPasswordHash()));
        // Comprueba que los dos valores sean distintos.
        assertNotEquals("UnaClave123", captor.getValue().getPasswordHash());
    }
    // Caso de prueba.
    @Test void rechazaCorreoDuplicadoSinGuardar() {
        // Respuesta simulada.
        when(usuarios.existsByCorreo("a@duoc.cl")).thenReturn(true);
        // Comprueba la excepción esperada.
        assertThrows(ApiException.class, () -> service.registrar(new RegistroDTO("a@duoc.cl", "UnaClave123")));
        // Verifica las llamadas esperadas.
        verify(usuarios, never()).save(any());
    }
    // Caso de prueba.
    @Test void rechazaPasswordQueSuperaLimiteEnBytes() {
        // Comprueba la excepción esperada.
        assertThrows(ApiException.class, () -> service.registrar(new RegistroDTO("a@duoc.cl", "ñ".repeat(40))));
        // Comprueba que no hubo llamadas adicionales.
        verifyNoInteractions(usuarios);
    }
    // Caso de prueba.
    @Test void loginNoEmiteTokensConClaveIncorrecta() {
        // Crea una cuenta ficticia de prueba.
        Usuario usuario = new Usuario(); usuario.setPasswordHash(new BCryptPasswordEncoder().encode("OtraClave123"));
        // Respuesta simulada.
        when(usuarios.findByCorreo("a@duoc.cl")).thenReturn(Optional.of(usuario));
        // Comprueba la excepción esperada.
        assertThrows(ApiException.class, () -> service.login(new LoginDTO("a@duoc.cl", "Incorrecta")));
        // Comprueba que no hubo llamadas adicionales.
        verifyNoInteractions(encoder, tokens);
    }
    // Caso de prueba.
    @Test void renovacionDesconocidaSeRechaza() {
        // Respuesta simulada.
        when(tokens.buscarParaRenovar(any())).thenReturn(Optional.empty());
        // Comprueba la excepción esperada.
        assertThrows(ApiException.class, () -> service.renovar("inexistente"));
        // Comprueba que no hubo llamadas adicionales.
        verifyNoInteractions(encoder);
    }
    // Caso de prueba.
    @Test void logoutEsIdempotenteYNoGuardaTokenEnClaro() {
        // Ejecuta logout con un texto ficticio y luego comprueba que se busque su hash.
        service.logout("secreto");
        // Crea un capturador para inspeccionar el valor que el servicio intenta enviar a la dependencia simulada.
        ArgumentCaptor<String> hash = ArgumentCaptor.forClass(String.class);
        // Verifica las llamadas esperadas.
        verify(tokens).buscarParaRenovar(hash.capture());
        // Comprueba el resultado.
        assertEquals(64, hash.getValue().length());
        // Comprueba que los dos valores sean distintos.
        assertNotEquals("secreto", hash.getValue());
    }
}

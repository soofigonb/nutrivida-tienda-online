package cl.nutrivida.autenticacion.controller;

import cl.nutrivida.autenticacion.config.JwtConfig;
import cl.nutrivida.autenticacion.config.SecurityConfig;
import cl.nutrivida.autenticacion.dto.UsuarioMapper;
import cl.nutrivida.autenticacion.exceptions.GlobalExceptionHandler;
import cl.nutrivida.autenticacion.model.EstadoUsuario;
import cl.nutrivida.autenticacion.model.Rol;
import cl.nutrivida.autenticacion.model.TokenRenovacion;
import cl.nutrivida.autenticacion.model.Usuario;
import cl.nutrivida.autenticacion.repository.EstadoUsuarioRepository;
import cl.nutrivida.autenticacion.repository.RolRepository;
import cl.nutrivida.autenticacion.repository.TokenRenovacionRepository;
import cl.nutrivida.autenticacion.repository.UsuarioRepository;
import cl.nutrivida.autenticacion.service.AutenticacionService;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyPairGenerator;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Prueba HTTP con JWT real y repositorios simulados.
@WebMvcTest
@ContextConfiguration(classes = {AutenticacionController.class, SecurityConfig.class,
    JwtConfig.class, AutenticacionService.class, UsuarioMapper.class, GlobalExceptionHandler.class})
class AutenticacionHttpTest {
    private static final String BASE = "/api/v1/autenticacion";
    private static final String EMISOR = "http://autenticacion.test";
    private static final String CORREO = "cliente@example.com";
    private static final String CLAVE = "ClavePrueba123";
    private static final String CREDENCIALES = """
        {"correo":"cliente@example.com","password":"ClavePrueba123"}
        """;

    @TempDir static Path claves;
    @Autowired MockMvc mvc;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtEncoder jwtEncoder;
    @MockitoBean UsuarioRepository usuarios;
    @MockitoBean RolRepository roles;
    @MockitoBean EstadoUsuarioRepository estados;
    @MockitoBean TokenRenovacionRepository tokens;

    @BeforeAll
    static void generarClavesDePrueba() throws Exception {
        var generador = KeyPairGenerator.getInstance("RSA");
        generador.initialize(2048);
        var par = generador.generateKeyPair();
        guardarPem("public.pem", "PUBLIC KEY", par.getPublic().getEncoded());
        guardarPem("private.pem", "PRIVATE KEY", par.getPrivate().getEncoded());
    }

    private static void guardarPem(String archivo, String tipo, byte[] clave) throws Exception {
        Files.writeString(claves.resolve(archivo), "-----BEGIN " + tipo + "-----\n"
            + Base64.getEncoder().encodeToString(clave) + "\n-----END " + tipo + "-----\n");
    }

    @DynamicPropertySource
    static void configurarJwt(DynamicPropertyRegistry propiedades) {
        propiedades.add("app.jwt.issuer", () -> EMISOR);
        propiedades.add("app.jwt.public-key", () -> claves.resolve("public.pem").toUri().toString());
        propiedades.add("app.jwt.private-key", () -> claves.resolve("private.pem").toUri().toString());
    }

    @Test
    void registraCuentaSinExponerElHash() throws Exception {
        configurarRegistro();
        when(usuarios.save(any())).thenAnswer(llamada -> llamada.getArgument(0));

        enviar("/registro", CREDENCIALES).andExpect(status().isCreated())
            .andExpect(jsonPath("$.correo").value(CORREO))
            .andExpect(jsonPath("$.rol").value("CLIENTE"))
            .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void rechazaRegistroInvalido() throws Exception {
        enviar("/registro", """
            {"correo":"correo-invalido","password":"x"}
            """).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errores").isArray());
        verifyNoInteractions(usuarios);
    }

    @Test
    void devuelveConflictoSiOtraSolicitudRegistroElCorreo() throws Exception {
        configurarRegistro();
        when(usuarios.save(any())).thenThrow(new DataIntegrityViolationException("duplicado"));

        enviar("/registro", CREDENCIALES).andExpect(status().isConflict())
            .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void iniciaSesionConsultaCuentaYRotaLaRenovacion() throws Exception {
        Usuario cuenta = cuentaActiva();
        when(usuarios.findByCorreo(CORREO)).thenReturn(Optional.of(cuenta));
        when(usuarios.findById(cuenta.getId())).thenReturn(Optional.of(cuenta));

        String sesion = enviar("/login", CREDENCIALES).andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        String acceso = JsonPath.read(sesion, "$.accessToken");
        String refresh = JsonPath.read(sesion, "$.refreshToken");
        mvc.perform(get(BASE + "/me").header("Authorization", "Bearer " + acceso))
            .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(cuenta.getId().toString()));

        var guardados = ArgumentCaptor.forClass(TokenRenovacion.class);
        verify(tokens).saveAndFlush(guardados.capture());
        TokenRenovacion original = guardados.getValue();
        when(tokens.buscarParaRenovar(original.getTokenHash())).thenReturn(Optional.of(original));

        String renovada = enviar("/renovar", cuerpoRenovacion(refresh)).andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        String refreshNuevo = JsonPath.read(renovada, "$.refreshToken");
        verify(tokens, times(2)).saveAndFlush(guardados.capture());
        TokenRenovacion reemplazo = guardados.getValue();
        assertNotEquals(refresh, refreshNuevo);
        assertNotEquals(refresh, original.getTokenHash());
        assertEquals(original.getFamiliaId(), reemplazo.getFamiliaId());
        assertSame(reemplazo, original.getReemplazadoPor());
        enviar("/renovar", cuerpoRenovacion(refresh)).andExpect(status().isUnauthorized());

        when(tokens.buscarParaRenovar(reemplazo.getTokenHash())).thenReturn(Optional.of(reemplazo));
        enviar("/logout", cuerpoRenovacion(refreshNuevo)).andExpect(status().isNoContent());
        enviar("/renovar", cuerpoRenovacion(refreshNuevo)).andExpect(status().isUnauthorized());
    }

    @Test
    void requiereSesionYReservaAdministracionAlRolCorrecto() throws Exception {
        mvc.perform(get(BASE + "/me")).andExpect(status().isUnauthorized());
        mvc.perform(get(BASE + "/usuarios").header("Authorization", bearer("CLIENTE")))
            .andExpect(status().isForbidden());
        verifyNoInteractions(usuarios);
    }

    @Test
    void administradorConsultaActualizaYDesactivaUnaCuenta() throws Exception {
        Usuario cuenta = cuentaActiva();
        UUID id = cuenta.getId();
        when(usuarios.findAll()).thenReturn(List.of(cuenta));
        when(usuarios.findById(id)).thenReturn(Optional.of(cuenta));
        when(roles.findByNombre("VENDEDOR")).thenReturn(Optional.of(rol("VENDEDOR")));
        when(estados.findByNombre("ACTIVO")).thenReturn(Optional.of(estado("ACTIVO")));
        when(estados.findByNombre("INACTIVO")).thenReturn(Optional.of(estado("INACTIVO")));
        String admin = bearer("ADMINISTRADOR");

        mvc.perform(get(BASE + "/usuarios").header("Authorization", admin))
            .andExpect(status().isOk()).andExpect(jsonPath("$[0].correo").value(CORREO));
        mvc.perform(get(BASE + "/usuarios/{id}", id).header("Authorization", admin))
            .andExpect(status().isOk()).andExpect(jsonPath("$.rol").value("CLIENTE"));
        mvc.perform(put(BASE + "/usuarios/{id}", id).header("Authorization", admin)
                .contentType("application/json").content("""
                {"rol":"VENDEDOR","estado":"ACTIVO"}
                """))
            .andExpect(status().isOk()).andExpect(jsonPath("$.rol").value("VENDEDOR"));
        mvc.perform(delete(BASE + "/usuarios/{id}", id).header("Authorization", admin))
            .andExpect(status().isNoContent());
        assertEquals("INACTIVO", cuenta.getEstadoUsuario().getNombre());
        verify(tokens, times(2)).revocarPorUsuario(id);
        when(usuarios.findByCorreo(CORREO)).thenReturn(Optional.of(cuenta));
        enviar("/login", CREDENCIALES).andExpect(status().isUnauthorized());
    }

    @Test
    void jwksExponeSoloLaClavePublica() throws Exception {
        mvc.perform(get("/.well-known/jwks.json")).andExpect(status().isOk())
            .andExpect(jsonPath("$.keys[0].kty").value("RSA"))
            .andExpect(jsonPath("$.keys[0].n").exists())
            .andExpect(jsonPath("$.keys[0].d").doesNotExist());
    }

    private ResultActions enviar(String ruta, String json) throws Exception {
        return mvc.perform(post(BASE + ruta).contentType("application/json").content(json));
    }

    private String bearer(String rol) {
        Instant ahora = Instant.now();
        var claims = JwtClaimsSet.builder().issuer(EMISOR).subject(UUID.randomUUID().toString())
            .issuedAt(ahora).expiresAt(ahora.plusSeconds(120)).claim("roles", List.of(rol)).build();
        return "Bearer " + jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    private Usuario cuentaActiva() {
        Usuario cuenta = new Usuario();
        cuenta.setId(UUID.randomUUID());
        cuenta.setCorreo(CORREO);
        cuenta.setPasswordHash(passwordEncoder.encode(CLAVE));
        cuenta.setRol(rol("CLIENTE"));
        cuenta.setEstadoUsuario(estado("ACTIVO"));
        return cuenta;
    }

    private void configurarRegistro() {
        when(roles.findByNombre("CLIENTE")).thenReturn(Optional.of(rol("CLIENTE")));
        when(estados.findByNombre("ACTIVO")).thenReturn(Optional.of(estado("ACTIVO")));
    }

    private static Rol rol(String nombre) {
        Rol rol = new Rol();
        rol.setNombre(nombre);
        return rol;
    }

    private static EstadoUsuario estado(String nombre) {
        EstadoUsuario estado = new EstadoUsuario();
        estado.setNombre(nombre);
        return estado;
    }

    private static String cuerpoRenovacion(String token) {
        return "{\"refreshToken\":\"" + token + "\"}";
    }
}

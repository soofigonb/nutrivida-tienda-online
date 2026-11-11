// Pruebas del componente.

// Paquete de la clase.
package cl.nutrivida.ordenes.service;

// Importa BigDecimal.
import java.math.BigDecimal;
// Importa los tipos del paquete.
import java.util.*;
// Importa CatalogoPort.
import cl.nutrivida.ordenes.port.CatalogoPort;
import cl.nutrivida.ordenes.client.AgendamientoClient;
// Importa los tipos del paquete.
import cl.nutrivida.ordenes.dto.*;
// Importa los tipos del paquete.
import cl.nutrivida.ordenes.model.*;
// Importa OrdenRepository.
import cl.nutrivida.ordenes.repository.OrdenRepository;
// Importa ApiException.
import cl.nutrivida.ordenes.exceptions.ApiException;
// Importa los tipos del paquete.
import org.junit.jupiter.api.*;
// Importa ExtendWith.
import org.junit.jupiter.api.extension.ExtendWith;
// Importa los tipos del paquete.
import org.mockito.*;
// Importa MockitoExtension.
import org.mockito.junit.jupiter.MockitoExtension;
// Importa Jwt.
import org.springframework.security.oauth2.jwt.Jwt;
// Importa los tipos del paquete.
import static org.junit.jupiter.api.Assertions.*;
// Importa los tipos del paquete.
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
// Define la clase.
class OrdenServiceTest {
    // Simula la dependencia.
    @Mock OrdenRepository repository;
    // Simula la dependencia.
    @Mock CatalogoPort catalogo;
    @Mock AgendamientoClient agendamiento;
    // Servicio que se prueba.
    OrdenService service;
    // Identificadores de prueba.
    UUID usuario = UUID.randomUUID();
    Jwt jwt;
    @BeforeEach void preparar() {
        // Prepara el servicio con dependencias simuladas.
        service = new OrdenService(repository, new OrdenMapper(), catalogo, agendamiento);
        jwt = Jwt.withTokenValue("jwt").header("alg", "RS256").subject(usuario.toString()).claim("roles", List.of("CLIENTE")).build();
    }
    // Caso de prueba.
    @Test void calculaTotalConPrecioDelCatalogo() {
        // Respuesta simulada.
        when(catalogo.consultar(1L, "jwt")).thenReturn(new CatalogoPort.ProductoDTO(1L, "Consulta", new BigDecimal("30000"), true));
        // Respuesta simulada.
        when(repository.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));
        // Identificadores de prueba.
        OrdenDTO resultado = service.crear(new CrearOrdenDTO(UUID.randomUUID(), List.of(new CrearOrdenDTO.ItemDTO(1L, 2))), jwt);
        // Comprueba el resultado.
        assertEquals(new BigDecimal("60000"), resultado.total());
        // Comprueba el resultado.
        assertEquals(usuario, resultado.idUsuario());
        // Comprueba el resultado.
        assertEquals(EstadoOrden.PENDIENTE, resultado.estado());
    }
    // Caso de prueba.
    @Test void rechazaPlanesInactivosSinGuardar() {
        // Respuesta simulada.
        when(catalogo.consultar(1L, "jwt")).thenReturn(new CatalogoPort.ProductoDTO(1L, "Consulta", BigDecimal.TEN, false));
        // Comprueba la excepción esperada.
        assertThrows(ApiException.class, () -> service.crear(new CrearOrdenDTO(UUID.randomUUID(), List.of(new CrearOrdenDTO.ItemDTO(1L, 1))), jwt));
        // Verifica las llamadas esperadas.
        verify(repository, never()).saveAndFlush(any());
    }
    // Caso de prueba.
    @Test void clienteNoPuedeLeerOrdenAjena() {
        Orden orden = new Orden(); orden.setIdUsuario(UUID.randomUUID());
        // Identificadores de prueba.
        UUID id = UUID.randomUUID(); when(repository.findById(id)).thenReturn(Optional.of(orden));
        // Comprueba la excepción esperada.
        assertThrows(ApiException.class, () -> service.obtener(id, jwt));
    }
    // Caso de prueba.
    @Test void clienteSoloListaSusOrdenes() {
        // Respuesta simulada.
        when(repository.findByIdUsuarioAndPublicadaTrueOrderByCreadoEnDesc(usuario)).thenReturn(List.of());
        // Verifica la condición.
        assertTrue(service.listar(jwt).isEmpty());
        // Verifica las llamadas esperadas.
        verify(repository, never()).findByPublicadaTrueOrderByCreadoEnDesc();
    }

    @Test void ocultaElBorradorHastaQueSeConfirmenTodasSusCitas() {
        UUID id = UUID.randomUUID();
        Orden orden = new Orden();
        orden.setIdUsuario(usuario);
        orden.setPublicada(false);
        DetalleOrden detalle = new DetalleOrden();
        detalle.setCantidad(2);
        orden.getDetalles().add(detalle);
        when(repository.findById(id)).thenReturn(Optional.of(orden));
        when(agendamiento.contarConfirmadas(id, "jwt")).thenReturn(1L).thenReturn(2L);

        assertThrows(ApiException.class, () -> service.obtener(id, jwt));
        assertThrows(ApiException.class, () -> service.publicar(id, jwt));
        assertFalse(orden.isPublicada());
        service.publicar(id, jwt);
        assertTrue(orden.isPublicada());
        assertEquals(EstadoOrden.PENDIENTE, service.obtener(id, jwt).estado());
    }
    // Caso de prueba.
    @Test void noPermiteReabrirOrdenCancelada() {
        Orden orden = new Orden(); orden.setIdUsuario(usuario); orden.setEstado(EstadoOrden.CANCELADA);
        // Identificadores de prueba.
        UUID id = UUID.randomUUID(); when(repository.findById(id)).thenReturn(Optional.of(orden));
        // Comprueba la excepción esperada.
        assertThrows(ApiException.class, () -> service.cambiarEstado(id, EstadoOrden.PENDIENTE, jwt));
        // Comprueba el resultado.
        assertEquals(EstadoOrden.CANCELADA, orden.getEstado());
    }
    // Caso de prueba.
    @Test void reintentoDevuelveOrdenExistenteSinConsultarCatalogo() {
        UUID clave = UUID.randomUUID(); Orden orden = new Orden(); orden.setIdUsuario(usuario);
        DetalleOrden d = new DetalleOrden(); d.setIdPlan(1L); d.setCantidad(2); orden.getDetalles().add(d);
        // Respuesta simulada.
        when(repository.findByIdUsuarioAndClaveIdempotencia(usuario, clave)).thenReturn(Optional.of(orden));
        service.crear(new CrearOrdenDTO(clave, List.of(new CrearOrdenDTO.ItemDTO(1L, 2))), jwt);
        // Comprueba que no hubo llamadas adicionales.
        verifyNoInteractions(catalogo);
        // Verifica las llamadas esperadas.
        verify(repository, never()).saveAndFlush(any());
    }
    // Caso de prueba.
    @Test void claveReutilizadaConOtrosDatosSeRechaza() {
        UUID clave = UUID.randomUUID(); Orden orden = new Orden(); orden.setIdUsuario(usuario);
        // Respuesta simulada.
        when(repository.findByIdUsuarioAndClaveIdempotencia(usuario, clave)).thenReturn(Optional.of(orden));
        // Comprueba la excepción esperada.
        assertThrows(ApiException.class, () -> service.crear(new CrearOrdenDTO(clave, List.of(new CrearOrdenDTO.ItemDTO(1L, 2))), jwt));
        // Comprueba que no hubo llamadas adicionales.
        verifyNoInteractions(catalogo);
    }
}


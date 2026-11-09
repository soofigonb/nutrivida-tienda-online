package cl.nutrivida.ordenes.controller;

import cl.nutrivida.ordenes.config.SecurityConfig;
import cl.nutrivida.ordenes.dto.CrearOrdenDTO;
import cl.nutrivida.ordenes.dto.OrdenDTO;
import cl.nutrivida.ordenes.exceptions.ApiException;
import cl.nutrivida.ordenes.exceptions.GlobalExceptionHandler;
import cl.nutrivida.ordenes.model.EstadoOrden;
import cl.nutrivida.ordenes.service.OrdenService;
import feign.FeignException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Comprueba rutas y permisos sin consultar servicios externos.
@WebMvcTest
@ContextConfiguration(classes = {OrdenController.class, SecurityConfig.class, GlobalExceptionHandler.class})
class OrdenHttpTest {
    private static final String BASE = "/api/v1/ordenes";
    private static final UUID ID = UUID.fromString("17094c06-ec70-4b41-a329-84532e537a14");
    private static final UUID CLIENTE = UUID.fromString("713abff5-fb56-4a51-a836-05d05045f337");
    private static final UUID CLAVE = UUID.fromString("2017952b-0413-4e90-ad01-849cc0ef4687");
    private static final String SOLICITUD = """
        {"claveIdempotencia":"%s","detalles":[{"idItem":17,"cantidad":2}]}
        """.formatted(CLAVE);

    @Autowired MockMvc mvc;
    @MockitoBean OrdenService servicio;
    @MockitoBean JwtDecoder decoder;

    @Test
    void clienteCreaOrdenConElUsuarioDelToken() throws Exception {
        Jwt jwt = token("CLIENTE");
        var esperado = new CrearOrdenDTO(CLAVE, List.of(new CrearOrdenDTO.ItemDTO(17L, 2)));
        when(servicio.crear(esperado, jwt)).thenReturn(orden(EstadoOrden.PENDIENTE));

        crear("CLIENTE", SOLICITUD).andExpect(status().isCreated())
            .andExpect(jsonPath("$.idUsuario").value(CLIENTE.toString()))
            .andExpect(jsonPath("$.total").value(24000));
        verify(servicio).crear(esperado, jwt);
    }

    @Test
    void vendedorConsultaListaYDetallePeroNoCreaOrdenes() throws Exception {
        Jwt jwt = token("VENDEDOR");
        OrdenDTO orden = orden(EstadoOrden.PENDIENTE);
        when(servicio.listar(jwt)).thenReturn(List.of(orden));
        when(servicio.obtener(ID, jwt)).thenReturn(orden);

        mvc.perform(get(BASE).header("Authorization", "Bearer VENDEDOR"))
            .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(ID.toString()));
        mvc.perform(get(BASE + "/{id}", ID).header("Authorization", "Bearer VENDEDOR"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.detalles[0].idItem").value(17));
        crear("VENDEDOR", SOLICITUD).andExpect(status().isForbidden());
        verify(servicio, never()).crear(any(), any());
    }

    @Test
    void administradorConfirmaYClientePuedeCancelarSuOrden() throws Exception {
        Jwt admin = token("ADMINISTRADOR");
        Jwt cliente = token("CLIENTE");
        when(servicio.cambiarEstado(ID, EstadoOrden.CONFIRMADA, admin))
            .thenReturn(orden(EstadoOrden.CONFIRMADA));

        mvc.perform(put(BASE + "/{id}", ID).header("Authorization", "Bearer ADMINISTRADOR")
                .contentType("application/json").content("{\"estado\":\"CONFIRMADA\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("CONFIRMADA"));
        mvc.perform(delete(BASE + "/{id}", ID).header("Authorization", "Bearer CLIENTE"))
            .andExpect(status().isNoContent());
        verify(servicio).cambiarEstado(ID, EstadoOrden.CANCELADA, cliente);
    }

    @Test
    void bloqueaConsultaSinJwtYConfirmacionPorCliente() throws Exception {
        mvc.perform(get(BASE)).andExpect(status().isUnauthorized());
        token("CLIENTE");
        mvc.perform(put(BASE + "/{id}", ID).header("Authorization", "Bearer CLIENTE")
                .contentType("application/json").content("{\"estado\":\"CONFIRMADA\"}"))
            .andExpect(status().isForbidden());
        verifyNoInteractions(servicio);
    }

    @Test
    void validaCantidadesAntesDeCrear() throws Exception {
        token("CLIENTE");
        crear("CLIENTE", """
            {"claveIdempotencia":"%s","detalles":[{"idItem":17,"cantidad":0}]}
            """.formatted(CLAVE)).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400));
        verifyNoInteractions(servicio);
    }

    @Test
    void devuelve404ParaUnaOrdenAjena() throws Exception {
        Jwt jwt = token("CLIENTE");
        when(servicio.obtener(ID, jwt)).thenThrow(new ApiException(HttpStatus.NOT_FOUND, "Orden no encontrada"));

        mvc.perform(get(BASE + "/{id}", ID).header("Authorization", "Bearer CLIENTE"))
            .andExpect(status().isNotFound()).andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void informaConflictoSiLaOrdenYaFueGuardada() throws Exception {
        Jwt jwt = token("CLIENTE");
        when(servicio.crear(any(), eq(jwt))).thenThrow(new DataIntegrityViolationException("duplicado"));

        crear("CLIENTE", SOLICITUD).andExpect(status().isConflict())
            .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void informa503CuandoElCatalogoNoResponde() throws Exception {
        Jwt jwt = token("CLIENTE");
        when(servicio.crear(any(), eq(jwt))).thenThrow(mock(FeignException.class));

        crear("CLIENTE", SOLICITUD).andExpect(status().isServiceUnavailable())
            .andExpect(jsonPath("$.status").value(503));
    }

    private ResultActions crear(String rol, String json) throws Exception {
        return mvc.perform(post(BASE).header("Authorization", "Bearer " + rol)
            .contentType("application/json").content(json));
    }

    private Jwt token(String rol) {
        Jwt jwt = Jwt.withTokenValue(rol).header("alg", "RS256").subject(CLIENTE.toString())
            .claim("roles", List.of(rol)).build();
        when(decoder.decode(rol)).thenReturn(jwt);
        return jwt;
    }

    private static OrdenDTO orden(EstadoOrden estado) {
        return new OrdenDTO(ID, CLIENTE, estado, BigDecimal.valueOf(24000), Instant.EPOCH,
            List.of(new OrdenDTO.DetalleDTO(17L, "Consulta", 2, BigDecimal.valueOf(12000))));
    }
}

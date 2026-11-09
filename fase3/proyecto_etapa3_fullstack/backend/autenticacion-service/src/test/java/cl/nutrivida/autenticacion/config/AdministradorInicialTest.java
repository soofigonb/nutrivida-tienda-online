package cl.nutrivida.autenticacion.config;

import java.util.Set;
import java.util.UUID;
import cl.nutrivida.autenticacion.dto.UsuarioDTO;
import cl.nutrivida.autenticacion.repository.UsuarioRepository;
import cl.nutrivida.autenticacion.service.AutenticacionService;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdministradorInicialTest {
    @Test void noModificaCuentasSiYaExisteAdministrador() {
        var service = mock(AutenticacionService.class);
        var usuarios = mock(UsuarioRepository.class);
        var validator = mock(Validator.class);
        when(usuarios.existsByRol_Nombre("ADMINISTRADOR")).thenReturn(true);
        new AdministradorInicial(service, usuarios, validator, "", "").run(null);
        verifyNoInteractions(service, validator);
    }
    @Test void creaYAsignaElPrimerAdministradorConDatosDelOperador() {
        var service = mock(AutenticacionService.class);
        var usuarios = mock(UsuarioRepository.class);
        var validator = mock(Validator.class);
        when(validator.validate(any())).thenReturn(Set.of());
        UUID id = UUID.randomUUID();
        when(service.registrar(any())).thenReturn(new UsuarioDTO(id, "admin@ejemplo.cl", "CLIENTE", "ACTIVO"));
        new AdministradorInicial(service, usuarios, validator, "admin@ejemplo.cl", "Temporal123").run(null);
        verify(service).actualizar(id, "ADMINISTRADOR", "ACTIVO");
    }
    @Test void rechazaUnaClaveQueExcedeElLimiteEnBytes() {
        var service = mock(AutenticacionService.class);
        var usuarios = mock(UsuarioRepository.class);
        var validator = mock(Validator.class);
        when(validator.validate(any())).thenReturn(Set.of());
        assertThrows(IllegalStateException.class, () -> new AdministradorInicial(service, usuarios, validator, "admin@ejemplo.cl", "ñ".repeat(40)).run(null));
        verifyNoInteractions(service);
    }
}

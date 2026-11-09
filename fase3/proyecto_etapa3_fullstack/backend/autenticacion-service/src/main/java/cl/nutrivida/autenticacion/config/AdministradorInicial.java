package cl.nutrivida.autenticacion.config;

import cl.nutrivida.autenticacion.dto.RegistroDTO;
import cl.nutrivida.autenticacion.dto.UsuarioDTO;
import cl.nutrivida.autenticacion.repository.UsuarioRepository;
import cl.nutrivida.autenticacion.service.AutenticacionService;
import jakarta.validation.Validator;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "app.bootstrap.enabled", havingValue = "true")
public class AdministradorInicial implements ApplicationRunner {
    private final AutenticacionService service;
    private final UsuarioRepository usuarios;
    private final Validator validator;
    private final String correo;
    private final String password;

    public AdministradorInicial(AutenticacionService service, UsuarioRepository usuarios, Validator validator,
        @Value("${app.bootstrap.email:}") String correo, @Value("${app.bootstrap.password:}") String password) {
        this.service = service; this.usuarios = usuarios; this.validator = validator;
        this.correo = correo; this.password = password;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (usuarios.existsByRol_Nombre("ADMINISTRADOR")) return;
        RegistroDTO dto = new RegistroDTO(correo, password);
        if (!validator.validate(dto).isEmpty() || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException("Configure un correo y contraseña inicial válidos mediante el entorno");
        }
        UsuarioDTO creado = service.registrar(dto);
        service.actualizar(creado.id(), "ADMINISTRADOR", "ACTIVO");
    }
}

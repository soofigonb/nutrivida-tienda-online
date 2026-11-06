// Convierte una cuenta JPA a su respuesta pública.

// Paquete de la clase.
package cl.nutrivida.autenticacion.dto;

// Importa Component.
import org.springframework.stereotype.Component;
// Importa Usuario.
import cl.nutrivida.autenticacion.model.Usuario;

// Registra esta clase auxiliar como un componente inyectable.
@Component
// Define la clase.
public class UsuarioMapper {
    // Convierte la entidad a DTO.
    public UsuarioDTO toDTO(Usuario usuario) {
        // Empieza la respuesta pública con UUID y correo.
        return new UsuarioDTO(usuario.getId(), usuario.getCorreo(),
            // Incluye los nombres de rol y estado.
            usuario.getRol().getNombre(), usuario.getEstadoUsuario().getNombre());
    }
}

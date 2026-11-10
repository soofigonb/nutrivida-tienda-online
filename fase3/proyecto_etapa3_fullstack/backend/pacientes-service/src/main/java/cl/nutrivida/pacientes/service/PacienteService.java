package cl.nutrivida.pacientes.service;

import cl.nutrivida.pacientes.dto.PacienteDTO;
import cl.nutrivida.pacientes.exceptions.AccesoDenegadoException;
import cl.nutrivida.pacientes.exceptions.RecursoNoEncontradoException;
import cl.nutrivida.pacientes.mapper.PacienteMapper;
import cl.nutrivida.pacientes.model.Paciente;
import cl.nutrivida.pacientes.repository.PacienteRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PacienteService {
    @Value("${app.security.roles-claim:roles}")
    private String claimRoles = "roles";

    private final PacienteRepository repository;
    private final PacienteMapper mapper;

    public PacienteService(PacienteRepository repository, PacienteMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    // GET / -> solo activos
    public List<PacienteDTO> listarActivos() {
        return repository.findByActivoTrue().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    // GET /me -> obtener perfil propio desde el sub del JWT
    public PacienteDTO obtenerPerfilPropio(Jwt jwt) {
        UUID usuarioId = extraerUsuarioId(jwt);
        Paciente p = repository.findByUsuarioId(usuarioId)
                .filter( pac -> Boolean.TRUE.equals(pac.getActivo()))
                .orElseThrow(() -> new RecursoNoEncontradoException("Perfil de paciente no encontrado para la cuenta actual"));
        return mapper.toDTO(p);
    }

    // PUT /me -> crear o actualizar de forma idempotente el perfil propio vinculado al sub del JWT
    public PacienteDTO guardarPerfilPropio(PacienteDTO dto, Jwt jwt) {
        UUID usuarioId = extraerUsuarioId(jwt);
        validarDatosBasicos(dto);

        String runNormalizado = dto.getRun().trim().toUpperCase();
        String correoNormalizado = normalizarCorreoOpcional(dto.getCorreo());

        Optional<Paciente> previo = repository.findByUsuarioId(usuarioId);
        if (previo.isPresent()) {
            Paciente existente = previo.get();
            if (!Boolean.TRUE.equals(existente.getActivo())) {
                throw new AccesoDenegadoException("El perfil fue dado de baja");
            }
            Long id = existente.getPacienteId();
            if (repository.existsByRunAndActivoTrueAndPacienteIdNot(runNormalizado, id)) {
                throw new IllegalArgumentException("El RUN ya está registrado por otro paciente");
            }
            if (correoNormalizado != null && repository.existsByCorreoIgnoreCaseAndActivoTrueAndPacienteIdNot(correoNormalizado, id)) {
                throw new IllegalArgumentException("El correo ya está registrado por otro paciente");
            }
            existente.setUsuarioId(usuarioId);
            existente.setRun(runNormalizado);
            existente.setNombre(dto.getNombre().trim());
            existente.setApellidos(dto.getApellidos().trim());
            if (correoNormalizado != null) {
                existente.setCorreo(correoNormalizado);
            }
            existente.setTelefono(dto.getTelefono());
            existente.setDireccion(dto.getDireccion());
            existente.setFechaNacimiento(dto.getFechaNacimiento());
            existente.setRegion(dto.getRegion());
            existente.setComuna(dto.getComuna());
            return mapper.toDTO(repository.save(existente));
        }

        if (repository.existsByRunAndActivoTrue(runNormalizado)) {
            throw new IllegalArgumentException("El RUN ya está registrado");
        }
        if (correoNormalizado != null && repository.existsByCorreoIgnoreCaseAndActivoTrue(correoNormalizado)) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        Paciente nuevo = mapper.toEntity(dto);
        nuevo.setPacienteId(null);
        nuevo.setUsuarioId(usuarioId);
        nuevo.setRun(runNormalizado);
        nuevo.setNombre(dto.getNombre().trim());
        nuevo.setApellidos(dto.getApellidos().trim());
        nuevo.setCorreo(correoNormalizado);
        nuevo.setActivo(true);
        return mapper.toDTO(repository.save(nuevo));
    }

    // GET /{id}
    public PacienteDTO obtenerPorId(Long id) {
        return obtenerPorId(id, null);
    }

    public PacienteDTO obtenerPorId(Long id, Jwt jwt) {
        Paciente p = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado con id: " + id));
        verificarPropietarioOAdmin(p, jwt);
        return mapper.toDTO(p);
    }

    // POST /
    public PacienteDTO crear(PacienteDTO dto) {
        validar(dto);

        String runNormalizado = dto.getRun().trim().toUpperCase();
        String correoNormalizado = dto.getCorreo().trim().toLowerCase();

        if (repository.existsByRunAndActivoTrue(runNormalizado)) {
            throw new IllegalArgumentException("El RUN ya está registrado");
        }
        if (repository.existsByCorreoIgnoreCaseAndActivoTrue(correoNormalizado)) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        Paciente p = mapper.toEntity(dto);
        p.setPacienteId(null);
        p.setRun(runNormalizado);
        p.setNombre(dto.getNombre().trim());
        p.setApellidos(dto.getApellidos().trim());
        p.setCorreo(correoNormalizado);
        p.setActivo(true);

        Paciente guardado = repository.save(p);
        return mapper.toDTO(guardado);
    }

    // PUT /{id}
    public PacienteDTO actualizar(Long id, PacienteDTO dto) {
        return actualizar(id, dto, null);
    }

    public PacienteDTO actualizar(Long id, PacienteDTO dto, Jwt jwt) {
        Paciente existente = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado con id: " + id));
        verificarPropietarioOAdmin(existente, jwt);
        validar(dto);

        String runNormalizado = dto.getRun().trim().toUpperCase();
        String correoNormalizado = dto.getCorreo().trim().toLowerCase();

        if (repository.existsByRunAndActivoTrueAndPacienteIdNot(runNormalizado, id)) {
            throw new IllegalArgumentException("El RUN ya está registrado por otro paciente");
        }
        if (repository.existsByCorreoIgnoreCaseAndActivoTrueAndPacienteIdNot(correoNormalizado, id)) {
            throw new IllegalArgumentException("El correo ya está registrado por otro paciente");
        }

        existente.setRun(runNormalizado);
        existente.setNombre(dto.getNombre().trim());
        existente.setApellidos(dto.getApellidos().trim());
        existente.setCorreo(correoNormalizado);
        existente.setTelefono(dto.getTelefono());
        existente.setDireccion(dto.getDireccion());
        existente.setFechaNacimiento(dto.getFechaNacimiento());
        existente.setRegion(dto.getRegion());
        existente.setComuna(dto.getComuna());

        Paciente guardado = repository.save(existente);
        return mapper.toDTO(guardado);
    }

    // DELETE /{id} -> baja controlada
    public void darDeBaja(Long id) {
        Paciente existente = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado con id: " + id));
        existente.setActivo(false);
        repository.save(existente);
    }

    private void verificarPropietarioOAdmin(Paciente paciente, Jwt jwt) {
        if (jwt == null || esAdministrador(jwt)) {
            return;
        }
        UUID usuarioId = extraerUsuarioId(jwt);
        if (paciente.getUsuarioId() == null || !paciente.getUsuarioId().equals(usuarioId)) {
            throw new AccesoDenegadoException("No tienes permiso para acceder o modificar el perfil de otro paciente");
        }
    }

    private boolean esAdministrador(Jwt jwt) {
        List<String> roles = jwt.getClaimAsStringList(claimRoles);
        return roles != null && roles.contains("ADMINISTRADOR");
    }

    private UUID extraerUsuarioId(Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null || jwt.getSubject().isBlank()) {
            throw new AccesoDenegadoException("Token de sesión inválido o sin identificador de usuario");
        }
        try {
            return UUID.fromString(jwt.getSubject());
        } catch (IllegalArgumentException ex) {
            throw new AccesoDenegadoException("El identificador de la cuenta en el token no es un UUID válido");
        }
    }

    private String normalizarCorreoOpcional(String correo) {
        if (correo == null || correo.isBlank()) {
            return null;
        }
        String limpio = correo.trim().toLowerCase();
        if (!limpio.contains("@")) {
            throw new IllegalArgumentException("El correo electrónico no es válido");
        }
        return limpio;
    }

    private void validarDatosBasicos(PacienteDTO dto) {
        if (dto.getRun() == null || dto.getRun().isBlank()) {
            throw new IllegalArgumentException("El RUN es obligatorio");
        }
        if (dto.getNombre() == null || dto.getNombre().trim().length() < 2) {
            throw new IllegalArgumentException("El nombre debe tener al menos 2 caracteres");
        }
        if (dto.getApellidos() == null || dto.getApellidos().trim().length() < 2) {
            throw new IllegalArgumentException("Los apellidos deben tener al menos 2 caracteres");
        }
    }

    private void validar(PacienteDTO dto) {
        validarDatosBasicos(dto);
        if (dto.getCorreo() == null || dto.getCorreo().isBlank() || !dto.getCorreo().contains("@")) {
            throw new IllegalArgumentException("El correo electrónico no es válido");
        }
    }
}

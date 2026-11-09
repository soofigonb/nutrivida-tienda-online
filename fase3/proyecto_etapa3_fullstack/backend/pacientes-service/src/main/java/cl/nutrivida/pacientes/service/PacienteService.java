package cl.nutrivida.pacientes.service;

import cl.nutrivida.pacientes.dto.PacienteDTO;
import cl.nutrivida.pacientes.exceptions.RecursoNoEncontradoException;
import cl.nutrivida.pacientes.mapper.PacienteMapper;
import cl.nutrivida.pacientes.model.Paciente;
import cl.nutrivida.pacientes.repository.PacienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PacienteService {

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

    // GET /{id}
    public PacienteDTO obtenerPorId(Long id) {
        Paciente p = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado con id: " + id));
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
        Paciente existente = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado con id: " + id));
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

    private void validar(PacienteDTO dto) {
        if (dto.getRun() == null || dto.getRun().isBlank()) {
            throw new IllegalArgumentException("El RUN es obligatorio");
        }
        if (dto.getNombre() == null || dto.getNombre().trim().length() < 2) {
            throw new IllegalArgumentException("El nombre debe tener al menos 2 caracteres");
        }
        if (dto.getApellidos() == null || dto.getApellidos().trim().length() < 2) {
            throw new IllegalArgumentException("Los apellidos deben tener al menos 2 caracteres");
        }
        if (dto.getCorreo() == null || dto.getCorreo().isBlank() || !dto.getCorreo().contains("@")) {
            throw new IllegalArgumentException("El correo electrónico no es válido");
        }
    }
}

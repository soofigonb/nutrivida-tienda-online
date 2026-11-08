package cl.nutrivida.profesionales.service;

import cl.nutrivida.profesionales.dto.ProfesionalDTO;
import cl.nutrivida.profesionales.exceptions.RecursoNoEncontradoException;
import cl.nutrivida.profesionales.mapper.ProfesionalMapper;
import cl.nutrivida.profesionales.model.Profesional;
import cl.nutrivida.profesionales.repository.ProfesionalRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfesionalService {

    private final ProfesionalRepository repository;
    private final ProfesionalMapper mapper;

    public ProfesionalService(ProfesionalRepository repository, ProfesionalMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    // GET / -> solo activos
    public List<ProfesionalDTO> listarActivos() {
        return repository.findByActivoTrue().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    // GET /{id}
    public ProfesionalDTO obtenerPorId(Long id) {
        Profesional p = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado con id: " + id));
        return mapper.toDTO(p);
    }

    // POST /
    public ProfesionalDTO crear(ProfesionalDTO dto) {
        validar(dto);
        Profesional p = mapper.toEntity(dto);
        p.setProfesionalId(null);
        p.setActivo(true);
        Profesional guardado = repository.save(p);
        return mapper.toDTO(guardado);
    }

    // PUT /{id}
    public ProfesionalDTO actualizar(Long id, ProfesionalDTO dto) {
        Profesional existente = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado con id: " + id));
        validar(dto);

        existente.setNombre(dto.getNombre());
        existente.setEspecialidad(dto.getEspecialidad());
        existente.setExperiencia(dto.getExperiencia());
        existente.setModalidad(dto.getModalidad());
        existente.setDescripcion(dto.getDescripcion());
        existente.setImagenUrl(dto.getImagenUrl());

        Profesional guardado = repository.save(existente);
        return mapper.toDTO(guardado);
    }

    // DELETE /{id} -> baja controlada
    public void darDeBaja(Long id) {
        Profesional existente = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Profesional no encontrado con id: " + id));
        existente.setActivo(false);
        repository.save(existente);
    }

    private void validar(ProfesionalDTO dto) {
        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        if (dto.getEspecialidad() == null || dto.getEspecialidad().isBlank()) {
            throw new IllegalArgumentException("La especialidad es obligatoria");
        }
        if (dto.getExperiencia() == null || dto.getExperiencia() < 0) {
            throw new IllegalArgumentException("La experiencia debe ser 0 o mayor");
        }
        if (dto.getModalidad() == null || dto.getModalidad().isBlank()) {
            throw new IllegalArgumentException("La modalidad es obligatoria");
        }
        String modalidad = dto.getModalidad().trim();
        if (!modalidad.equalsIgnoreCase("Presencial")
                && !modalidad.equalsIgnoreCase("Online")
                && !modalidad.equalsIgnoreCase("Mixta")) {
            throw new IllegalArgumentException("Modalidad debe ser Presencial, Online o Mixta");
        }
    }
}
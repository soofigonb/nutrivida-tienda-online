package cl.nutrivida.agendamiento.service;

import cl.nutrivida.agendamiento.dto.ReservaDTO;
import cl.nutrivida.agendamiento.exceptions.RecursoNoEncontradoException;
import cl.nutrivida.agendamiento.mapper.ReservaMapper;
import cl.nutrivida.agendamiento.model.Reserva;
import cl.nutrivida.agendamiento.repository.ReservaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ReservaService {

    private static final Set<String> HORARIOS_PERMITIDOS = Set.of("09:00", "11:00", "15:00", "17:00");

    private final ReservaRepository repository;
    private final ReservaMapper mapper;

    public ReservaService(ReservaRepository repository, ReservaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    // GET / -> listar reservas activas
    public List<ReservaDTO> listarActivas() {
        return repository.findByActivoTrue().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    // GET /{id} -> obtener reserva por id
    public ReservaDTO obtenerPorId(Long id) {
        Reserva r = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada con id: " + id));
        return mapper.toDTO(r);
    }

    // POST / -> crear nueva reserva validando conflicto de horario
    public ReservaDTO crear(ReservaDTO dto) {
        validar(dto);

        boolean conflicto = repository.existsByNutricionistaIdAndFechaAndHoraAndActivoTrue(
                dto.getNutricionistaId(),
                dto.getFecha().trim(),
                dto.getHora().trim()
        );
        if (conflicto) {
            throw new IllegalArgumentException(
                    "El nutricionista seleccionado ya tiene una reserva en esa fecha y horario."
            );
        }

        Reserva r = mapper.toEntity(dto);
        r.setReservaId(null);
        r.setFecha(dto.getFecha().trim());
        r.setHora(dto.getHora().trim());
        r.setMotivo(dto.getMotivo().trim());
        r.setEstado(dto.getEstado() != null && !dto.getEstado().isBlank() ? dto.getEstado().trim() : "CONFIRMADA");
        r.setActivo(true);

        Reserva guardada = repository.save(r);
        return mapper.toDTO(guardada);
    }

    // PUT /{id} -> actualizar reserva existente
    public ReservaDTO actualizar(Long id, ReservaDTO dto) {
        Reserva existente = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada con id: " + id));
        validar(dto);

        boolean conflicto = repository.existsByNutricionistaIdAndFechaAndHoraAndActivoTrueAndReservaIdNot(
                dto.getNutricionistaId(),
                dto.getFecha().trim(),
                dto.getHora().trim(),
                id
        );
        if (conflicto) {
            throw new IllegalArgumentException(
                    "El nutricionista seleccionado ya tiene una reserva en esa fecha y horario."
            );
        }

        existente.setPacienteId(dto.getPacienteId());
        existente.setPlanId(dto.getPlanId());
        existente.setServicio(dto.getServicio());
        existente.setPrecio(dto.getPrecio());
        existente.setNutricionistaId(dto.getNutricionistaId());
        existente.setNutricionistaNombre(dto.getNutricionistaNombre());
        existente.setFecha(dto.getFecha().trim());
        existente.setHora(dto.getHora().trim());
        existente.setMotivo(dto.getMotivo().trim());
        if (dto.getEstado() != null && !dto.getEstado().isBlank()) {
            existente.setEstado(dto.getEstado().trim());
        }

        Reserva guardada = repository.save(existente);
        return mapper.toDTO(guardada);
    }

    // DELETE /{id} -> cancelar / dar de baja una reserva
    public void cancelar(Long id) {
        Reserva existente = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada con id: " + id));
        existente.setEstado("CANCELADA");
        existente.setActivo(false);
        repository.save(existente);
    }

    private void validar(ReservaDTO dto) {
        if (dto.getPlanId() == null || dto.getPlanId().isBlank()) {
            throw new IllegalArgumentException("Debes seleccionar un plan o servicio");
        }
        if (dto.getServicio() == null || dto.getServicio().isBlank()) {
            throw new IllegalArgumentException("El nombre del servicio es obligatorio");
        }
        if (dto.getPrecio() == null || dto.getPrecio() <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0");
        }
        if (dto.getNutricionistaId() == null) {
            throw new IllegalArgumentException("Debes seleccionar un profesional nutricionista");
        }
        if (dto.getNutricionistaNombre() == null || dto.getNutricionistaNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del nutricionista es obligatorio");
        }
        if (dto.getFecha() == null || !dto.getFecha().trim().matches("^\\d{4}-\\d{2}-\\d{2}$")) {
            throw new IllegalArgumentException("La fecha debe tener formato YYYY-MM-DD");
        }
        if (dto.getHora() == null || !HORARIOS_PERMITIDOS.contains(dto.getHora().trim())) {
            throw new IllegalArgumentException("El horario debe ser 09:00, 11:00, 15:00 o 17:00");
        }
        if (dto.getMotivo() == null || dto.getMotivo().trim().length() < 5 || dto.getMotivo().trim().length() > 100) {
            throw new IllegalArgumentException("El motivo debe tener entre 5 y 100 caracteres");
        }
    }
}


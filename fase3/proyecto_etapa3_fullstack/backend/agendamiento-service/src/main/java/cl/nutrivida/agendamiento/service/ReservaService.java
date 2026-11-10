package cl.nutrivida.agendamiento.service;

import cl.nutrivida.agendamiento.dto.ReservaDTO;
import cl.nutrivida.agendamiento.client.ReservaReferencias;
import cl.nutrivida.agendamiento.exceptions.AccesoDenegadoException;
import cl.nutrivida.agendamiento.exceptions.RecursoNoEncontradoException;
import cl.nutrivida.agendamiento.mapper.ReservaMapper;
import cl.nutrivida.agendamiento.model.Reserva;
import cl.nutrivida.agendamiento.repository.ReservaRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReservaService {

    private static final Set<String> HORARIOS_PERMITIDOS = Set.of("09:00", "11:00", "15:00", "17:00");

    private final ReservaRepository repository;
    private final ReservaMapper mapper;
    private final ReservaReferencias referencias;
    @Value("${app.security.roles-claim:roles}")
    private String claimRoles = "roles";

    public ReservaService(ReservaRepository repository, ReservaMapper mapper, ReservaReferencias referencias) {
        this.repository = repository;
        this.mapper = mapper;
        this.referencias = referencias;
    }

    // GET / -> listar reservas activas (todas para ADMINISTRADOR, propias para CLIENTE)
    public List<ReservaDTO> listarActivas() {
        return listarActivas(null);
    }

    public List<ReservaDTO> listarActivas(Jwt jwt) {
        List<Reserva> reservas = (jwt != null && !esAdministrador(jwt))
                ? repository.findByUsuarioIdAndActivoTrue(extraerUsuarioId(jwt))
                : repository.findByActivoTrue();
        return reservas.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    // GET /{id} -> obtener reserva por id verificando pertenencia
    public ReservaDTO obtenerPorId(Long id) {
        return obtenerPorId(id, null);
    }

    public ReservaDTO obtenerPorId(Long id, Jwt jwt) {
        Reserva r = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada con id: " + id));
        verificarPropietarioOAdmin(r, jwt);
        return mapper.toDTO(r);
    }

    // POST / -> crear nueva reserva identificando al paciente desde su sesión y validando conflicto de horario
    public ReservaDTO crear(ReservaDTO dto) {
        return crear(dto, null);
    }

    public ReservaDTO crear(ReservaDTO dto, Jwt jwt) {
        UUID usuario = jwt == null ? null : extraerUsuarioId(jwt);
        if (jwt != null && (!esAdministrador(jwt) || dto.getOrdenId() != null)) {
            if (dto.getOrdenId() == null || dto.getItemId() == null || dto.getUnidad() == null || dto.getUnidad() < 1) {
                throw new IllegalArgumentException("Identifica la unidad de la orden que quieres agendar");
            }
            var previa = repository.findByOrdenIdAndItemIdAndUnidad(dto.getOrdenId(), dto.getItemId(), dto.getUnidad());
            if (previa.isPresent()) {
                Reserva guardada = previa.get();
                verificarPropietarioOAdmin(guardada, jwt);
                if (!Boolean.TRUE.equals(guardada.getActivo())) {
                    throw new IllegalArgumentException("La cita de esa unidad está cancelada");
                }
                return mapper.toDTO(guardada);
            }
            var item = referencias.consultarItem(dto.getOrdenId(), dto.getItemId(), dto.getUnidad(), usuario, jwt);
            dto.setPlanId(String.valueOf(item.idItem()));
            dto.setServicio(item.nombreItem());
            dto.setPrecio(item.precioUnitario());
            dto.setPacienteId(referencias.consultarPaciente(jwt));
            dto.setNutricionistaNombre(referencias.consultarProfesional(dto.getNutricionistaId()));
            dto.setEstado("CONFIRMADA");
        }
        validar(dto);
        if (jwt != null) validarHorarioFuturo(dto);

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
        if (jwt != null) {
            r.setUsuarioId(usuario);
        }
        r.setFecha(dto.getFecha().trim());
        r.setHora(dto.getHora().trim());
        r.setMotivo(dto.getMotivo().trim());
        r.setEstado(dto.getEstado() != null && !dto.getEstado().isBlank() ? dto.getEstado().trim() : "CONFIRMADA");
        r.setActivo(true);

        Reserva guardada = repository.save(r);
        return mapper.toDTO(guardada);
    }

    // PUT /{id} -> actualizar reserva existente verificando pertenencia
    public ReservaDTO actualizar(Long id, ReservaDTO dto) {
        return actualizar(id, dto, null);
    }

    public ReservaDTO actualizar(Long id, ReservaDTO dto, Jwt jwt) {
        Reserva existente = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada con id: " + id));
        verificarPropietarioOAdmin(existente, jwt);
        if (!Boolean.TRUE.equals(existente.getActivo())) {
            throw new IllegalArgumentException("La cita está cancelada");
        }
        if (jwt != null && (!esAdministrador(jwt) || existente.getOrdenId() != null)) {
            // Conserva los datos de la compra.
            dto.setPacienteId(existente.getPacienteId());
            dto.setPlanId(existente.getPlanId());
            dto.setServicio(existente.getServicio());
            dto.setPrecio(existente.getPrecio());
            dto.setEstado(existente.getEstado());
            dto.setNutricionistaNombre(referencias.consultarProfesional(dto.getNutricionistaId()));
        }
        validar(dto);
        if (jwt != null) validarHorarioFuturo(dto);

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

        if (dto.getPacienteId() != null) {
            existente.setPacienteId(dto.getPacienteId());
        }
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

    // DELETE /{id} -> cancelar / dar de baja una reserva verificando pertenencia
    public void cancelar(Long id) {
        cancelar(id, null);
    }

    public void cancelar(Long id, Jwt jwt) {
        Reserva existente = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada con id: " + id));
        verificarPropietarioOAdmin(existente, jwt);
        existente.setEstado("CANCELADA");
        existente.setActivo(false);
        repository.save(existente);
    }

    private void verificarPropietarioOAdmin(Reserva reserva, Jwt jwt) {
        if (jwt == null || esAdministrador(jwt)) {
            return;
        }
        UUID usuarioId = extraerUsuarioId(jwt);
        if (reserva.getUsuarioId() == null || !reserva.getUsuarioId().equals(usuarioId)) {
            throw new AccesoDenegadoException("No tienes permiso para acceder o modificar una cita de otro paciente");
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

    private void validarHorarioFuturo(ReservaDTO dto) {
        try {
            var horario = LocalDateTime.parse(dto.getFecha().trim() + "T" + dto.getHora());
            if (!horario.isAfter(LocalDateTime.now(ZoneId.of("America/Santiago")))) {
                throw new IllegalArgumentException("El horario debe ser futuro");
            }
        } catch (DateTimeParseException error) {
            throw new IllegalArgumentException("La fecha de la cita no es válida");
        }
    }
}

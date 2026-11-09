package cl.nutrivida.agendamiento.repository;

import cl.nutrivida.agendamiento.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByActivoTrue();

    List<Reserva> findByUsuarioIdAndActivoTrue(UUID usuarioId);

    List<Reserva> findByPacienteIdAndActivoTrue(Long pacienteId);

    List<Reserva> findByNutricionistaIdAndActivoTrue(Long nutricionistaId);

    boolean existsByNutricionistaIdAndFechaAndHoraAndActivoTrue(
            Long nutricionistaId,
            String fecha,
            String hora
    );

    boolean existsByNutricionistaIdAndFechaAndHoraAndActivoTrueAndReservaIdNot(
            Long nutricionistaId,
            String fecha,
            String hora,
            Long reservaId
    );
}

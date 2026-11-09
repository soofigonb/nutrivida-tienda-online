package cl.nutrivida.pacientes.repository;

import cl.nutrivida.pacientes.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    List<Paciente> findByActivoTrue();

    boolean existsByRunAndActivoTrue(String run);

    boolean existsByRunAndActivoTrueAndPacienteIdNot(String run, Long pacienteId);

    boolean existsByCorreoIgnoreCaseAndActivoTrue(String correo);

    boolean existsByCorreoIgnoreCaseAndActivoTrueAndPacienteIdNot(String correo, Long pacienteId);
}


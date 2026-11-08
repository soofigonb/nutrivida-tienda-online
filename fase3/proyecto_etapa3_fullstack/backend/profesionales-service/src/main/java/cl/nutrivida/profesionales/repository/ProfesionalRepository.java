package cl.nutrivida.profesionales.repository;

import cl.nutrivida.profesionales.model.Profesional;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProfesionalRepository extends JpaRepository<Profesional, Long> {

    List<Profesional> findByActivoTrue();
}

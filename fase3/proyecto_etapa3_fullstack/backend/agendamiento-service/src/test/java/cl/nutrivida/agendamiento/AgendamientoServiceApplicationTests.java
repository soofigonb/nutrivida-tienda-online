// Pruebas del componente.

// Paquete de la clase.
package cl.nutrivida.agendamiento;

// Importa ReservaDTO.
import cl.nutrivida.agendamiento.dto.ReservaDTO;
// Importa ReservaMapper.
import cl.nutrivida.agendamiento.mapper.ReservaMapper;
// Importa Reserva.
import cl.nutrivida.agendamiento.model.Reserva;
// Importa Test.
import org.junit.jupiter.api.Test;
// Importa las aserciones de JUnit.
import static org.junit.jupiter.api.Assertions.*;

// Define la clase.
class AgendamientoServiceApplicationTests {

    // Caso de prueba.
    @Test
    // Define el caso mapeaEntidadADtoYConservaCamposClinicos.
    void mapeaEntidadADtoYConservaCamposClinicos() {
        // Prepara el convertidor del módulo de agendamiento.
        ReservaMapper mapper = new ReservaMapper();
        // Crea una entidad de prueba con todos sus datos clínicos y comerciales.
        Reserva entidad = new Reserva();
        entidad.setReservaId(15L);
        entidad.setPacienteId(3L);
        entidad.setPlanId("plan-deportivo");
        entidad.setServicio("Nutrición Deportiva");
        entidad.setPrecio(32000);
        entidad.setNutricionistaId(2L);
        entidad.setNutricionistaNombre("Dr. Diego Morales");
        entidad.setFecha("2027-06-10");
        entidad.setHora("11:00");
        entidad.setMotivo("Planificación de entrenamiento");
        entidad.setEstado("CONFIRMADA");
        entidad.setActivo(true);
        // Convierte la entidad a DTO de transferencia.
        ReservaDTO dto = mapper.toDTO(entidad);
        // Comprueba que cada atributo se conserve sin alteraciones.
        assertEquals(15L, dto.getReservaId());
        assertEquals(3L, dto.getPacienteId());
        assertEquals("plan-deportivo", dto.getPlanId());
        assertEquals("Nutrición Deportiva", dto.getServicio());
        assertEquals(32000, dto.getPrecio());
        assertEquals(2L, dto.getNutricionistaId());
        assertEquals("Dr. Diego Morales", dto.getNutricionistaNombre());
        assertEquals("2027-06-10", dto.getFecha());
        assertEquals("11:00", dto.getHora());
        assertEquals("CONFIRMADA", dto.getEstado());
        assertTrue(dto.getActivo());
    }

    // Caso de prueba.
    @Test
    // Define el caso asignaValoresPorDefectoAlConvertirDtoSinEstado.
    void asignaValoresPorDefectoAlConvertirDtoSinEstado() {
        // Prepara el convertidor del módulo de agendamiento.
        ReservaMapper mapper = new ReservaMapper();
        // Crea un DTO sin estado ni indicador activo explícito.
        ReservaDTO dto = new ReservaDTO();
        dto.setPlanId("plan-inicial");
        dto.setServicio("Consulta Nutricional Inicial");
        dto.setPrecio(25000);
        dto.setNutricionistaId(1L);
        dto.setNutricionistaNombre("Dra. Camila Rojas");
        dto.setFecha("2027-06-12");
        dto.setHora("09:00");
        dto.setMotivo("Evaluación general");
        // Convierte el DTO en entidad persistible.
        Reserva entidad = mapper.toEntity(dto);
        // Verifica que el mapper asigne CONFIRMADA y activo true por defecto.
        assertEquals("CONFIRMADA", entidad.getEstado());
        assertTrue(entidad.getActivo());
    }
}

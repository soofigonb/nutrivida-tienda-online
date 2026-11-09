// Pruebas del componente.

// Paquete de la clase.
package cl.nutrivida.pacientes;

// Importa PacienteDTO.
import cl.nutrivida.pacientes.dto.PacienteDTO;
// Importa PacienteMapper.
import cl.nutrivida.pacientes.mapper.PacienteMapper;
// Importa Paciente.
import cl.nutrivida.pacientes.model.Paciente;
// Importa Test.
import org.junit.jupiter.api.Test;
// Importa las aserciones de JUnit.
import static org.junit.jupiter.api.Assertions.*;

// Define la clase.
class PacientesServiceApplicationTests {

    // Caso de prueba.
    @Test
    // Define el caso mapeaEntidadADtoYConservaDatosDelPaciente.
    void mapeaEntidadADtoYConservaDatosDelPaciente() {
        // Prepara el convertidor del módulo de pacientes.
        PacienteMapper mapper = new PacienteMapper();
        // Crea una entidad de prueba con todos sus datos personales y de contacto.
        Paciente entidad = new Paciente();
        entidad.setPacienteId(8L);
        entidad.setRun("19876543-2");
        entidad.setNombre("Valentina");
        entidad.setApellidos("Soto Muñoz");
        entidad.setCorreo("valentina@duoc.cl");
        entidad.setTelefono("+56912345678");
        entidad.setDireccion("Av. Providencia 1234");
        entidad.setFechaNacimiento("1999-04-20");
        entidad.setRegion("Región Metropolitana de Santiago");
        entidad.setComuna("Providencia");
        entidad.setActivo(true);
        // Convierte la entidad a DTO de transferencia.
        PacienteDTO dto = mapper.toDTO(entidad);
        // Comprueba que cada atributo se conserve sin alteraciones.
        assertEquals(8L, dto.getPacienteId());
        assertEquals("19876543-2", dto.getRun());
        assertEquals("Valentina", dto.getNombre());
        assertEquals("Soto Muñoz", dto.getApellidos());
        assertEquals("valentina@duoc.cl", dto.getCorreo());
        assertEquals("+56912345678", dto.getTelefono());
        assertEquals("Providencia", dto.getComuna());
        assertTrue(dto.getActivo());
    }

    // Caso de prueba.
    @Test
    // Define el caso asignaActivoPorDefectoAlConvertirDtoEnEntidad.
    void asignaActivoPorDefectoAlConvertirDtoEnEntidad() {
        // Prepara el convertidor del módulo de pacientes.
        PacienteMapper mapper = new PacienteMapper();
        // Crea un DTO sin indicador activo explícito.
        PacienteDTO dto = new PacienteDTO();
        dto.setRun("20111222-3");
        dto.setNombre("Matías");
        dto.setApellidos("Rojas Díaz");
        dto.setCorreo("matias@gmail.com");
        // Convierte el DTO en entidad persistible.
        Paciente entidad = mapper.toEntity(dto);
        // Verifica que el mapper asigne activo true por defecto.
        assertEquals("20111222-3", entidad.getRun());
        assertTrue(entidad.getActivo());
    }
}

// Pruebas del componente.

// Paquete de la clase.
package cl.nutrivida.pacientes.service;

// Importa los tipos del paquete.
import java.util.*;
// Importa PacienteDTO.
import cl.nutrivida.pacientes.dto.PacienteDTO;
// Importa RecursoNoEncontradoException.
import cl.nutrivida.pacientes.exceptions.RecursoNoEncontradoException;
// Importa PacienteMapper.
import cl.nutrivida.pacientes.mapper.PacienteMapper;
// Importa Paciente.
import cl.nutrivida.pacientes.model.Paciente;
// Importa PacienteRepository.
import cl.nutrivida.pacientes.repository.PacienteRepository;
// Importa los tipos de JUnit.
import org.junit.jupiter.api.*;
// Importa ExtendWith.
import org.junit.jupiter.api.extension.ExtendWith;
// Importa los tipos de Mockito.
import org.mockito.*;
// Importa MockitoExtension.
import org.mockito.junit.jupiter.MockitoExtension;
// Importa las aserciones de JUnit.
import static org.junit.jupiter.api.Assertions.*;
// Importa los métodos estáticos de Mockito.
import static org.mockito.Mockito.*;

// Activa MockitoExtension, que crea y gestiona los objetos marcados con @Mock.
@ExtendWith(MockitoExtension.class)
// Define la clase.
class PacienteServiceTest {

    // Simula la dependencia del repositorio de pacientes.
    @Mock PacienteRepository repository;

    // Servicio que se prueba.
    PacienteService service;

    // Prepara objetos y respuestas antes de cada caso para mantener independientes las pruebas.
    @BeforeEach void preparar() {
        // Prepara el servicio con dependencias simuladas y el mapper real.
        service = new PacienteService(repository, new PacienteMapper());
    }

    // Construye un DTO válido base para reutilizar en los escenarios de prueba.
    private PacienteDTO dtoValido() {
        PacienteDTO dto = new PacienteDTO();
        dto.setRun("19876543-k");
        dto.setNombre("Valentina");
        dto.setApellidos("Soto Muñoz");
        dto.setCorreo(" VALENTINA@DUOC.CL ");
        dto.setTelefono("+56912345678");
        dto.setDireccion("Av. Providencia 1234");
        dto.setFechaNacimiento("1999-04-20");
        dto.setRegion("Región Metropolitana de Santiago");
        dto.setComuna("Providencia");
        return dto;
    }

    // Caso de prueba.
    @Test void creaPacienteNormalizandoRunYCorreo() {
        // Prepara los datos de entrada.
        PacienteDTO dto = dtoValido();
        when(repository.existsByRunAndActivoTrue("19876543-K")).thenReturn(false);
        when(repository.existsByCorreoIgnoreCaseAndActivoTrue("valentina@duoc.cl")).thenReturn(false);
        when(repository.save(any(Paciente.class))).thenAnswer(i -> {
            Paciente p = i.getArgument(0);
            p.setPacienteId(1L);
            return p;
        });
        // Ejecuta el registro del paciente.
        PacienteDTO creado = service.crear(dto);
        // Comprueba la normalización del RUN en mayúsculas y correo en minúsculas.
        assertEquals(1L, creado.getPacienteId());
        assertEquals("19876543-K", creado.getRun());
        assertEquals("valentina@duoc.cl", creado.getCorreo());
        assertTrue(creado.getActivo());
    }

    // Caso de prueba.
    @Test void listarActivosYObtenerPorIdExistenteDevuelvenPacientes() {
        // Prepara un paciente activo en el repositorio simulado.
        Paciente entidad = new PacienteMapper().toEntity(dtoValido());
        entidad.setPacienteId(2L);
        when(repository.findByActivoTrue()).thenReturn(List.of(entidad));
        when(repository.findById(2L)).thenReturn(Optional.of(entidad));
        // Comprueba el listado y la búsqueda por ID.
        assertEquals(1, service.listarActivos().size());
        assertEquals(2L, service.obtenerPorId(2L).getPacienteId());
    }

    // Caso de prueba.
    @Test void rechazaRunDuplicadoSinGuardar() {
        // Prepara un DTO cuyo RUN ya figura activo en la base de datos.
        PacienteDTO dto = dtoValido();
        when(repository.existsByRunAndActivoTrue("19876543-K")).thenReturn(true);
        // Comprueba la excepción esperada.
        assertThrows(IllegalArgumentException.class, () -> service.crear(dto));
        // Verifica que nunca se guarde el registro duplicado.
        verify(repository, never()).save(any());
    }

    // Caso de prueba.
    @Test void rechazaCorreoDuplicadoSinGuardar() {
        // Prepara un DTO cuyo correo ya figura activo en la base de datos.
        PacienteDTO dto = dtoValido();
        when(repository.existsByRunAndActivoTrue("19876543-K")).thenReturn(false);
        when(repository.existsByCorreoIgnoreCaseAndActivoTrue("valentina@duoc.cl")).thenReturn(true);
        // Comprueba la excepción esperada.
        assertThrows(IllegalArgumentException.class, () -> service.crear(dto));
        verify(repository, never()).save(any());
    }

    // Caso de prueba.
    @Test void rechazaDatosInvalidosEnRunNombreApellidosOCorreo() {
        // RUN vacío.
        PacienteDTO sinRun = dtoValido();
        sinRun.setRun(" ");
        assertThrows(IllegalArgumentException.class, () -> service.crear(sinRun));
        // Nombre demasiado corto.
        PacienteDTO nombreCorto = dtoValido();
        nombreCorto.setNombre("A");
        assertThrows(IllegalArgumentException.class, () -> service.crear(nombreCorto));
        // Apellidos demasiado cortos.
        PacienteDTO apellidoCorto = dtoValido();
        apellidoCorto.setApellidos("B");
        assertThrows(IllegalArgumentException.class, () -> service.crear(apellidoCorto));
        // Correo inválido sin arroba.
        PacienteDTO correoInvalido = dtoValido();
        correoInvalido.setCorreo("correo-sin-arroba");
        assertThrows(IllegalArgumentException.class, () -> service.crear(correoInvalido));
        verifyNoInteractions(repository);
    }

    // Caso de prueba.
    @Test void actualizaPacienteExistenteYValidaDuplicadosAlActualizar() {
        // Prepara un paciente existente almacenado.
        Paciente existente = new PacienteMapper().toEntity(dtoValido());
        existente.setPacienteId(4L);
        when(repository.findById(4L)).thenReturn(Optional.of(existente));
        when(repository.existsByRunAndActivoTrueAndPacienteIdNot("19876543-K", 4L)).thenReturn(false);
        when(repository.existsByCorreoIgnoreCaseAndActivoTrueAndPacienteIdNot("valentina@duoc.cl", 4L)).thenReturn(false);
        when(repository.save(any(Paciente.class))).thenAnswer(i -> i.getArgument(0));
        // Prepara los cambios de dirección y comuna.
        PacienteDTO cambios = dtoValido();
        cambios.setDireccion("Av. Apoquindo 4500");
        cambios.setComuna("Las Condes");
        // Ejecuta la actualización válida.
        PacienteDTO actualizado = service.actualizar(4L, cambios);
        assertEquals("Av. Apoquindo 4500", actualizado.getDireccion());
        assertEquals("Las Condes", actualizado.getComuna());
        // Simula correo duplicado en otro paciente al actualizar.
        when(repository.existsByCorreoIgnoreCaseAndActivoTrueAndPacienteIdNot("valentina@duoc.cl", 4L)).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> service.actualizar(4L, cambios));
        // Simula RUN duplicado en otro paciente al actualizar.
        when(repository.existsByRunAndActivoTrueAndPacienteIdNot("19876543-K", 4L)).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> service.actualizar(4L, cambios));
    }

    // Caso de prueba.
    @Test void darDeBajaDesactivaAlPaciente() {
        // Prepara un paciente activo en memoria.
        Paciente existente = new PacienteMapper().toEntity(dtoValido());
        existente.setPacienteId(6L);
        when(repository.findById(6L)).thenReturn(Optional.of(existente));
        // Ejecuta la baja controlada del paciente.
        service.darDeBaja(6L);
        // Comprueba que el indicador activo cambie a false.
        assertFalse(existente.getActivo());
        verify(repository).save(existente);
    }

    // Caso de prueba.
    @Test void obtenerPorIdInexistenteLanzaRecursoNoEncontrado() {
        // Simula que el identificador solicitado no existe.
        when(repository.findById(404L)).thenReturn(Optional.empty());
        // Comprueba la excepción esperada.
        assertThrows(RecursoNoEncontradoException.class, () -> service.obtenerPorId(404L));
    }
}

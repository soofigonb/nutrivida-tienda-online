package cl.nutrivida.pacientes.controller;

import cl.nutrivida.pacientes.dto.PacienteDTO;
import cl.nutrivida.pacientes.service.PacienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pacientes")
@CrossOrigin(origins = "*")
@Tag(
        name = "Pacientes",
        description = "Endpoints CRUD para la gestión de fichas y perfiles de pacientes de NutriVida"
)
public class PacienteController {

    private final PacienteService service;

    public PacienteController(PacienteService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(
            summary = "Listar pacientes activos",
            description = "Obtiene el listado de todos los pacientes con perfil activo en el sistema"
    )
    @ApiResponse(responseCode = "200", description = "Listado de pacientes obtenido correctamente")
    public List<PacienteDTO> listarActivos() {
        return service.listarActivos();
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Obtener paciente por ID",
            description = "Busca y retorna los datos de un paciente específico según su identificador"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paciente encontrado correctamente"),
            @ApiResponse(responseCode = "404", description = "Paciente no encontrado con el ID indicado")
    })
    public PacienteDTO obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @PostMapping
    @Operation(
            summary = "Registrar nuevo paciente",
            description = "Crea un nuevo perfil de paciente validando formato y unicidad de RUN y correo electrónico"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Paciente creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o RUN/correo ya registrado")
    })
    public ResponseEntity<PacienteDTO> crear(@RequestBody PacienteDTO dto) {
        PacienteDTO creado = service.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Actualizar paciente existente",
            description = "Actualiza la información personal y de contacto de un paciente registrado"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paciente actualizado correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o RUN/correo duplicado en otro paciente"),
            @ApiResponse(responseCode = "404", description = "Paciente no encontrado")
    })
    public PacienteDTO actualizar(@PathVariable Long id, @RequestBody PacienteDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Dar de baja paciente",
            description = "Realiza la desactivación lógica del perfil del paciente sin eliminar su historial"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Paciente dado de baja correctamente"),
            @ApiResponse(responseCode = "404", description = "Paciente no encontrado")
    })
    public ResponseEntity<Void> darDeBaja(@PathVariable Long id) {
        service.darDeBaja(id);
        return ResponseEntity.noContent().build();
    }
}

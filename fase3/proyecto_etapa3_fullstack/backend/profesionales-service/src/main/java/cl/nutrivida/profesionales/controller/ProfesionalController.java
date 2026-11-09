package cl.nutrivida.profesionales.controller;

import cl.nutrivida.profesionales.dto.ProfesionalDTO;
import cl.nutrivida.profesionales.service.ProfesionalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/profesionales")
@CrossOrigin(origins = "*")
@Tag(name = "Profesionales", description = "Endpoints para la gestión de nutricionistas y su disponibilidad")
public class ProfesionalController {

    private final ProfesionalService service;

    public ProfesionalController(ProfesionalService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar profesionales activos", description = "Retorna la lista de nutricionistas activos para reserva de citas")
    public List<ProfesionalDTO> listarActivos() {
        return service.listarActivos();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener profesional por ID", description = "Retorna el detalle público de un nutricionista")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profesional encontrado"),
        @ApiResponse(responseCode = "404", description = "Profesional no encontrado")
    })
    public ProfesionalDTO obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @PostMapping
    @Operation(summary = "Crear profesional (Admin)", description = "Registra un nuevo nutricionista validando sus campos obligatorios")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Profesional creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos o faltantes")
    })
    public ResponseEntity<ProfesionalDTO> crear(@Valid @RequestBody ProfesionalDTO dto) {
        ProfesionalDTO creado = service.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar profesional (Admin)", description = "Modifica la información de un nutricionista existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profesional actualizado correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
        @ApiResponse(responseCode = "404", description = "Profesional no encontrado")
    })
    public ProfesionalDTO actualizar(@PathVariable Long id, @Valid @RequestBody ProfesionalDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Baja controlada de profesional (Admin)", description = "Realiza la baja lógica (activo = false) conservando el historial")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Profesional dado de baja exitosamente"),
        @ApiResponse(responseCode = "404", description = "Profesional no encontrado")
    })
    public ResponseEntity<Void> darDeBaja(@PathVariable Long id) {
        service.darDeBaja(id);
        return ResponseEntity.noContent().build();
    }
}
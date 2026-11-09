package cl.nutrivida.agendamiento.controller;

import cl.nutrivida.agendamiento.dto.ReservaDTO;
import cl.nutrivida.agendamiento.service.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/agendamiento")
@CrossOrigin(origins = "*")
@Tag(
        name = "Agendamiento y Reservas",
        description = "Endpoints CRUD para gestionar la disponibilidad y reservas de consultas nutricionales"
)
public class ReservaController {

    private final ReservaService service;

    public ReservaController(ReservaService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(
            summary = "Listar reservas activas",
            description = "Obtiene el listado de todas las reservas de consultas nutricionales activas"
    )
    @ApiResponse(responseCode = "200", description = "Listado de reservas obtenido correctamente")
    public List<ReservaDTO> listarActivas() {
        return service.listarActivas();
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Obtener reserva por ID",
            description = "Busca y retorna el detalle de una reserva específica según su identificador"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reserva encontrada correctamente"),
            @ApiResponse(responseCode = "404", description = "Reserva no encontrada con el ID indicado")
    })
    public ReservaDTO obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @PostMapping
    @Operation(
            summary = "Crear nueva reserva",
            description = "Registra una nueva cita nutricional validando que no exista conflicto de fecha y horario con el profesional"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Reserva creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o conflicto de horario con el nutricionista")
    })
    public ResponseEntity<ReservaDTO> crear(@RequestBody ReservaDTO dto) {
        ReservaDTO creada = service.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Actualizar reserva existente",
            description = "Modifica los datos de una reserva activa verificando la disponibilidad horaria del nutricionista"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reserva actualizada correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o conflicto de horario"),
            @ApiResponse(responseCode = "404", description = "Reserva no encontrada")
    })
    public ReservaDTO actualizar(@PathVariable Long id, @RequestBody ReservaDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Cancelar reserva",
            description = "Realiza la baja lógica de una reserva cambiando su estado a CANCELADA y liberando el bloque horario"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Reserva cancelada correctamente"),
            @ApiResponse(responseCode = "404", description = "Reserva no encontrada")
    })
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        service.cancelar(id);
        return ResponseEntity.noContent().build();
    }
}

package cl.nutrivida.agendamiento.controller;

import cl.nutrivida.agendamiento.dto.ReservaDTO;
import cl.nutrivida.agendamiento.service.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/agendamiento")
@CrossOrigin(origins = "*")
@Tag(name = "Agendamiento", description = "Endpoints CRUD para la gestión de reservas y citas nutricionales")
public class ReservaController {

    private final ReservaService service;

    public ReservaController(ReservaService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar todas las reservas activas")
    public List<ReservaDTO> listarActivas() {
        return service.listarActivas();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una reserva por su ID")
    public ReservaDTO obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @PostMapping
    @Operation(summary = "Crear una nueva reserva nutricional")
    public ResponseEntity<ReservaDTO> crear(@RequestBody ReservaDTO dto) {
        ReservaDTO creada = service.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una reserva existente")
    public ReservaDTO actualizar(@PathVariable Long id, @RequestBody ReservaDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancelar o dar de baja una reserva por su ID")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        service.cancelar(id);
        return ResponseEntity.noContent().build();
    }
}

package cl.nutrivida.profesionales.controller;

import cl.nutrivida.profesionales.dto.ProfesionalDTO;
import cl.nutrivida.profesionales.service.ProfesionalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/profesionales")
@CrossOrigin(origins = "*")
public class ProfesionalController {

    private final ProfesionalService service;

    public ProfesionalController(ProfesionalService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProfesionalDTO> listarActivos() {
        return service.listarActivos();
    }

    @GetMapping("/{id}")
    public ProfesionalDTO obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<ProfesionalDTO> crear(@RequestBody ProfesionalDTO dto) {
        ProfesionalDTO creado = service.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public ProfesionalDTO actualizar(@PathVariable Long id, @RequestBody ProfesionalDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> darDeBaja(@PathVariable Long id) {
        service.darDeBaja(id);
        return ResponseEntity.noContent().build();
    }
}
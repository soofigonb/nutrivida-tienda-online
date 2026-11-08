package cl.nutrivida.profesionales.controller;

import cl.nutrivida.profesionales.model.Profesional;
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
    public List<Profesional> listarActivos() {
        return service.listarActivos();
    }

    @GetMapping("/{id}")
    public Profesional obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<Profesional> crear(@RequestBody Profesional profesional) {
        Profesional creado = service.crear(profesional);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public Profesional actualizar(@PathVariable Long id, @RequestBody Profesional profesional) {
        return service.actualizar(id, profesional);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> darDeBaja(@PathVariable Long id) {
        service.darDeBaja(id);
        return ResponseEntity.noContent().build();
    }
}

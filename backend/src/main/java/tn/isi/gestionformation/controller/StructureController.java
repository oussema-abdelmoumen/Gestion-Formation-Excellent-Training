package tn.isi.gestionformation.controller;

import tn.isi.gestionformation.entity.Structure;
import tn.isi.gestionformation.service.StructureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/structures")
@CrossOrigin(origins = "http://localhost:4200")
public class StructureController {

    @Autowired
    private StructureService service;

    // GET : accessible à tous les utilisateurs authentifiés (ADMIN, UTILISATEUR, RESPONSABLE)
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<Structure> getAll() {
        return service.findAll();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<Structure> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    // POST / PUT / DELETE : réservé à ADMIN uniquement
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Structure> create(@Valid @RequestBody Structure entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Structure> update(@PathVariable Integer id, @Valid @RequestBody Structure entity) {
        entity.setId(id);
        return ResponseEntity.ok(service.save(entity));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

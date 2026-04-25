package tn.isi.gestionformation.controller;

import tn.isi.gestionformation.entity.Domaine;
import tn.isi.gestionformation.service.DomaineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/domaines")
@CrossOrigin(origins = "http://localhost:4200")
public class DomaineController {

    @Autowired
    private DomaineService service;

    // Lecture accessible à tous les rôles (ADMIN, RESPONSABLE, UTILISATEUR)
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Domaine> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Domaine> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    // Écriture réservée à ADMIN uniquement
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Domaine> create(@Valid @RequestBody Domaine entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Domaine> update(@PathVariable Integer id, @Valid @RequestBody Domaine entity) {
        entity.setId(id);
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

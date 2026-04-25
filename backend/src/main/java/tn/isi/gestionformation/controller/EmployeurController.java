package tn.isi.gestionformation.controller;

import tn.isi.gestionformation.entity.Employeur;
import tn.isi.gestionformation.service.EmployeurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import java.util.List;

@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/employeurs")
@CrossOrigin(origins = "http://localhost:4200")
public class EmployeurController {

    @Autowired
    private EmployeurService service;

    @GetMapping
    public List<Employeur> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employeur> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<Employeur> create(@Valid @RequestBody Employeur entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employeur> update(@PathVariable Integer id, @Valid @RequestBody Employeur entity) {
        entity.setId(id);
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

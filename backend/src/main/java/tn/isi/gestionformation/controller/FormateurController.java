package tn.isi.gestionformation.controller;

import tn.isi.gestionformation.entity.Formateur;
import tn.isi.gestionformation.service.FormateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/formateurs")
@CrossOrigin(origins = "http://localhost:4200")
public class FormateurController {

    @Autowired
    private FormateurService service;

    @GetMapping
    public List<Formateur> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Formateur> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','UTILISATEUR')")
    @PostMapping
    public ResponseEntity<Formateur> create(@Valid @RequestBody Formateur entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @PreAuthorize("hasAnyRole('ADMIN','UTILISATEUR')")
    @PutMapping("/{id}")
    public ResponseEntity<Formateur> update(@PathVariable Integer id, @Valid @RequestBody Formateur entity) {
        entity.setId(id);
        return ResponseEntity.ok(service.save(entity));
    }

    @PreAuthorize("hasAnyRole('ADMIN','UTILISATEUR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

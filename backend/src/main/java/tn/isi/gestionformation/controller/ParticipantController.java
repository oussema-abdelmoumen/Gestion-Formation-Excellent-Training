package tn.isi.gestionformation.controller;

import tn.isi.gestionformation.entity.Participant;
import tn.isi.gestionformation.service.ParticipantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/participants")
@CrossOrigin(origins = "http://localhost:4200")
public class ParticipantController {

    @Autowired
    private ParticipantService service;

    @GetMapping
    public List<Participant> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Participant> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','UTILISATEUR')")
    @PostMapping
    public ResponseEntity<Participant> create(@Valid @RequestBody Participant entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @PreAuthorize("hasAnyRole('ADMIN','UTILISATEUR')")
    @PutMapping("/{id}")
    public ResponseEntity<Participant> update(@PathVariable Integer id, @Valid @RequestBody Participant entity) {
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

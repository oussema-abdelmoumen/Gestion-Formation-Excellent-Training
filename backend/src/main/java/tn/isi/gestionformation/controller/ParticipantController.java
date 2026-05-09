package tn.isi.gestionformation.controller;

import tn.isi.gestionformation.entity.Participant;
import tn.isi.gestionformation.service.ParticipantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

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

    @PreAuthorize("hasAnyRole('ADMIN','UTILISATEUR')")
    @PostMapping("/delete-bulk")
    public ResponseEntity<Map<String, Object>> deleteBulk(@RequestBody List<Integer> ids) {
        int deleted = 0;
        List<String> errors = new java.util.ArrayList<>();
        for (Integer id : ids) {
            try { service.delete(id); deleted++; }
            catch (Exception e) { errors.add("ID " + id + ": " + e.getMessage()); }
        }
        return ResponseEntity.ok(Map.of("deleted", deleted, "errors", errors));
    }

    @PreAuthorize("hasAnyRole('ADMIN','UTILISATEUR')")
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Le fichier est vide"));
            }
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.endsWith(".xlsx")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Le fichier doit être au format .xlsx"));
            }
            Map<String, Object> result = service.importFromExcel(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Erreur lors de l'import: " + e.getMessage()));
        }
    }
}

package tn.isi.gestionformation.service;

import tn.isi.gestionformation.entity.Employeur;
import tn.isi.gestionformation.repository.EmployeurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EmployeurService {

    @Autowired
    private EmployeurRepository repository;

    public List<Employeur> findAll() {
        return repository.findAll();
    }

    public Employeur findById(Integer id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employeur non trouvé avec l'id: " + id));
    }

    public Employeur save(Employeur entity) {
        return repository.save(entity);
    }

    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Employeur non trouvé avec l'id: " + id);
        }
        repository.deleteById(id);
    }
}

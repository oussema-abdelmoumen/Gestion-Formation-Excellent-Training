package tn.isi.gestionformation.service;

import tn.isi.gestionformation.entity.Formateur;
import tn.isi.gestionformation.repository.FormateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FormateurService {

    @Autowired
    private FormateurRepository repository;

    public List<Formateur> findAll() {
        return repository.findAll();
    }

    public Formateur findById(Integer id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Formateur non trouvé avec l'id: " + id));
    }

    public Formateur save(Formateur entity) {
        return repository.save(entity);
    }

    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Formateur non trouvé avec l'id: " + id);
        }
        repository.deleteById(id);
    }
}

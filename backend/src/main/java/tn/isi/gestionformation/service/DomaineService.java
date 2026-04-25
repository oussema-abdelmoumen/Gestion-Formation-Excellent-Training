package tn.isi.gestionformation.service;

import tn.isi.gestionformation.entity.Domaine;
import tn.isi.gestionformation.repository.DomaineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DomaineService {

    @Autowired
    private DomaineRepository repository;

    public List<Domaine> findAll() {
        return repository.findAll();
    }

    public Domaine findById(Integer id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Domaine non trouvé avec l'id: " + id));
    }

    public Domaine save(Domaine entity) {
        return repository.save(entity);
    }

    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Domaine non trouvé avec l'id: " + id);
        }
        repository.deleteById(id);
    }
}

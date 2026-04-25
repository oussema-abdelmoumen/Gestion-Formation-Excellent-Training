package tn.isi.gestionformation.service;

import tn.isi.gestionformation.entity.Structure;
import tn.isi.gestionformation.repository.StructureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StructureService {

    @Autowired
    private StructureRepository repository;

    public List<Structure> findAll() {
        return repository.findAll();
    }

    public Structure findById(Integer id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Structure non trouvé avec l'id: " + id));
    }

    public Structure save(Structure entity) {
        return repository.save(entity);
    }

    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Structure non trouvé avec l'id: " + id);
        }
        repository.deleteById(id);
    }
}

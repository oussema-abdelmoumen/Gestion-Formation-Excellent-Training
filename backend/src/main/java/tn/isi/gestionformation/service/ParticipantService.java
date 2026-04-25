package tn.isi.gestionformation.service;

import tn.isi.gestionformation.entity.Participant;
import tn.isi.gestionformation.repository.ParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ParticipantService {

    @Autowired
    private ParticipantRepository repository;

    public List<Participant> findAll() {
        return repository.findAll();
    }

    public Participant findById(Integer id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Participant non trouvé avec l'id: " + id));
    }

    public Participant save(Participant entity) {
        return repository.save(entity);
    }

    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Participant non trouvé avec l'id: " + id);
        }
        repository.deleteById(id);
    }
}

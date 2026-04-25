package tn.isi.gestionformation.service;

import tn.isi.gestionformation.entity.Profil;
import tn.isi.gestionformation.repository.ProfilRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProfilService {

    @Autowired
    private ProfilRepository repository;

    public List<Profil> findAll() {
        return repository.findAll();
    }

    public Profil findById(Integer id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Profil non trouvé avec l'id: " + id));
    }

    public Profil save(Profil entity) {
        return repository.save(entity);
    }

    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Profil non trouvé avec l'id: " + id);
        }
        repository.deleteById(id);
    }
}

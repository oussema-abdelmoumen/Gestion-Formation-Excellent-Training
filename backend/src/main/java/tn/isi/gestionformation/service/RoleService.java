package tn.isi.gestionformation.service;

import tn.isi.gestionformation.entity.Role;
import tn.isi.gestionformation.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RoleService {

    @Autowired
    private RoleRepository repository;

    public List<Role> findAll() {
        return repository.findAll();
    }

    public Role findById(Integer id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Role non trouvé avec l'id: " + id));
    }

    public Role save(Role entity) {
        return repository.save(entity);
    }

    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Role non trouvé avec l'id: " + id);
        }
        repository.deleteById(id);
    }
}

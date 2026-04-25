package tn.isi.gestionformation.service;

import tn.isi.gestionformation.entity.Formation;
import tn.isi.gestionformation.repository.FormationRepository;
import tn.isi.gestionformation.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FormationService {

    @Autowired private FormationRepository formationRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;

    public List<Formation> findAll() {
        return formationRepository.findAll().stream()
            .peek(this::populateLogin).collect(Collectors.toList());
    }

    public List<Formation> findByUserId(Integer userId) {
        return formationRepository.findAll().stream()
            .filter(f -> f.getCreatedById() != null && f.getCreatedById().equals(userId))
            .peek(this::populateLogin).collect(Collectors.toList());
    }

    private void populateLogin(Formation f) {
        if (f.getCreatedById() != null) {
            utilisateurRepository.findById(f.getCreatedById())
                .ifPresent(u -> f.setCreatedByLogin(u.getLogin()));
        }
    }

    public Formation findById(Long id) {
        Formation f = formationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Formation non trouvée"));
        populateLogin(f);
        return f;
    }

    public Formation save(Formation formation) { return formationRepository.save(formation); }
    public void delete(Long id) { formationRepository.deleteById(id); }

    public Map<String, Long> countByDomaine() {
        Map<String, Long> result = new LinkedHashMap<>();
        formationRepository.findAll().forEach(f -> {
            String domaine = f.getDomaine() != null ? f.getDomaine().getLibelle() : "Non défini";
            result.merge(domaine, 1L, Long::sum);
        });
        return result;
    }

    public Map<Integer, Long> countByAnnee() {
        Map<Integer, Long> result = new LinkedHashMap<>();
        formationRepository.findAll().forEach(f -> result.merge(f.getAnnee(), 1L, Long::sum));
        return result;
    }

    public Map<String, Double> budgetByDomaine() {
        Map<String, Double> result = new LinkedHashMap<>();
        formationRepository.findAll().forEach(f -> {
            String domaine = f.getDomaine() != null ? f.getDomaine().getLibelle() : "Non défini";
            result.merge(domaine, f.getBudget() != null ? f.getBudget() : 0.0, Double::sum);
        });
        return result;
    }

    public Map<String, Long> countByStructure() {
        Map<String, Long> result = new LinkedHashMap<>();
        formationRepository.findAll().forEach(f -> {
            if (f.getParticipants() != null) {
                f.getParticipants().forEach(p -> {
                    String structure = p.getStructure() != null ? p.getStructure().getLibelle() : "Non défini";
                    result.merge(structure, 1L, Long::sum);
                });
            }
        });
        return result;
    }
}

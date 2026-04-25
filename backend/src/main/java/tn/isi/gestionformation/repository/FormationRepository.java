package tn.isi.gestionformation.repository;

import tn.isi.gestionformation.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FormationRepository extends JpaRepository<Formation, Long> {
    List<Formation> findByAnnee(Integer annee);
    List<Formation> findByDomaineId(Integer domaineId);
}

package tn.isi.gestionformation.repository;

import tn.isi.gestionformation.entity.Domaine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DomaineRepository extends JpaRepository<Domaine, Integer> {
}

package tn.isi.gestionformation.repository;

import tn.isi.gestionformation.entity.Formateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FormateurRepository extends JpaRepository<Formateur, Integer> {
}

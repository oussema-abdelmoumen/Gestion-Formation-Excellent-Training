package tn.isi.gestionformation.repository;

import tn.isi.gestionformation.entity.Employeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeurRepository extends JpaRepository<Employeur, Integer> {
}

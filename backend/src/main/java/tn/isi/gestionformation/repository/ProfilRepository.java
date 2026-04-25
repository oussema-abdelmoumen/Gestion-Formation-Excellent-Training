package tn.isi.gestionformation.repository;

import tn.isi.gestionformation.entity.Profil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfilRepository extends JpaRepository<Profil, Integer> {
}

package tn.isi.gestionformation.repository;

import tn.isi.gestionformation.entity.Structure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StructureRepository extends JpaRepository<Structure, Integer> {
}

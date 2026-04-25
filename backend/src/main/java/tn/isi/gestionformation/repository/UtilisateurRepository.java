package tn.isi.gestionformation.repository;

import tn.isi.gestionformation.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Integer> {
    Optional<Utilisateur> findByLogin(String login);
    boolean existsByLogin(String login);
    boolean existsByEmail(String email);
    Optional<Utilisateur> findByTokenVerification(String token);

@Modifying
@Transactional
@Query(value = "SET FOREIGN_KEY_CHECKS = 0", nativeQuery = true)
void disableFKChecks();

@Modifying
@Transactional
@Query(value = "SET FOREIGN_KEY_CHECKS = 1", nativeQuery = true)
void enableFKChecks();
}
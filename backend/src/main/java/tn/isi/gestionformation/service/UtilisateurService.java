package tn.isi.gestionformation.service;

import tn.isi.gestionformation.entity.Utilisateur;
import tn.isi.gestionformation.entity.Role;
import tn.isi.gestionformation.repository.UtilisateurRepository;
import tn.isi.gestionformation.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UtilisateurService {

    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private RoleRepository roleRepository;
    @Autowired private EmailService emailService;

    public List<Utilisateur> findAll() { return utilisateurRepository.findAll(); }

    public Utilisateur findById(Integer id) {
        return utilisateurRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    public Utilisateur findByLogin(String login) {
        return utilisateurRepository.findByLogin(login)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    // Admin creates user — no strong password required, activated immediately
    public Utilisateur create(Utilisateur utilisateur) {
        if (utilisateurRepository.existsByLogin(utilisateur.getLogin()))
            throw new RuntimeException("Ce login existe déjà");
        if (utilisateur.getEmail() != null && utilisateurRepository.existsByEmail(utilisateur.getEmail()))
            throw new RuntimeException("Cet email est déjà utilisé");
        utilisateur.setPassword(passwordEncoder.encode(utilisateur.getPassword()));
        utilisateur.setEmailVerifie(true);
        utilisateur.setActif(true);
        return utilisateurRepository.save(utilisateur);
    }

    // Self-registration — requires email verification
    public Utilisateur register(Utilisateur utilisateur) {
        if (utilisateurRepository.existsByLogin(utilisateur.getLogin()))
            throw new RuntimeException("Ce login existe déjà");
        if (utilisateurRepository.existsByEmail(utilisateur.getEmail()))
            throw new RuntimeException("Cet email est déjà utilisé");

        // Assign UTILISATEUR role by default
        Role role = roleRepository.findByNom("UTILISATEUR")
            .orElseThrow(() -> new RuntimeException("Rôle UTILISATEUR introuvable"));
        utilisateur.setRole(role);
        utilisateur.setPassword(passwordEncoder.encode(utilisateur.getPassword()));
        utilisateur.setEmailVerifie(false);
        utilisateur.setActif(false);

        // Generate verification token
        String token = UUID.randomUUID().toString();
        utilisateur.setTokenVerification(token);

        Utilisateur saved = utilisateurRepository.save(utilisateur);
        emailService.sendVerificationEmail(saved.getEmail(), saved.getLogin(), token);
        return saved;
    }

    public boolean verifyEmail(String token) {
        return utilisateurRepository.findByTokenVerification(token).map(u -> {
            u.setEmailVerifie(true);
            u.setActif(true);
            u.setTokenVerification(null);
            utilisateurRepository.save(u);
            return true;
        }).orElse(false);
    }

    public Utilisateur update(Integer id, Utilisateur utilisateur) {
        Utilisateur existing = findById(id);
        existing.setLogin(utilisateur.getLogin());
        existing.setRole(utilisateur.getRole());
        if (utilisateur.getEmail() != null) existing.setEmail(utilisateur.getEmail());
        if (utilisateur.getPassword() != null && !utilisateur.getPassword().isBlank())
            existing.setPassword(passwordEncoder.encode(utilisateur.getPassword()));
        return utilisateurRepository.save(existing);
    }

    @Transactional
    public void delete(Integer id) {
        utilisateurRepository.disableFKChecks();
        utilisateurRepository.deleteById(id);
        utilisateurRepository.enableFKChecks();
    }
}

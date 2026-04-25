package tn.isi.gestionformation.controller;

import tn.isi.gestionformation.config.JwtUtil;
import tn.isi.gestionformation.entity.Utilisateur;
import tn.isi.gestionformation.repository.UtilisateurRepository;
import tn.isi.gestionformation.service.UtilisateurService;
import tn.isi.gestionformation.service.CaptchaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UtilisateurService utilisateurService;
    @Autowired private CaptchaService captchaService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String login    = request.get("login");
        String password = request.get("password");

        Utilisateur user = utilisateurRepository.findByLogin(login).orElse(null);
        if (user == null || !passwordEncoder.matches(password, user.getPassword()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Identifiant ou mot de passe incorrect"));

        if (!user.isActif())
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Compte non activé. Vérifiez votre email."));

        String token = jwtUtil.generateToken(login, user.getRole().getNom());
        return ResponseEntity.ok(Map.of(
            "token", token, "role", user.getRole().getNom(),
            "login", login, "id", user.getId()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest req,
            BindingResult result) {

        // Validate fields
        if (result.hasErrors()) {
            String errors = result.getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body(Map.of("error", errors));
        }

        // Verify CAPTCHA
        if (req.getCaptchaToken() == null || !captchaService.verifyCaptcha(req.getCaptchaToken()))
            return ResponseEntity.badRequest().body(Map.of("error", "Validation CAPTCHA échouée. Veuillez réessayer."));

        // Validate strong password
        if (!isStrongPassword(req.getPassword()))
            return ResponseEntity.badRequest().body(Map.of("error",
                "Mot de passe faible. Il doit contenir : majuscule, minuscule, chiffre, caractère spécial et au moins 8 caractères."));

        try {
            Utilisateur u = new Utilisateur();
            u.setLogin(req.getLogin());
            u.setEmail(req.getEmail());
            u.setPassword(req.getPassword());
            utilisateurService.register(u);
            return ResponseEntity.ok(Map.of("message",
                "Inscription réussie ! Un email de vérification a été envoyé à " + req.getEmail()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        boolean ok = utilisateurService.verifyEmail(token);
        if (ok) return ResponseEntity.ok(Map.of("message", "Email vérifié ! Vous pouvez maintenant vous connecter."));
        return ResponseEntity.badRequest().body(Map.of("error", "Token invalide ou expiré."));
    }

    private boolean isStrongPassword(String password) {
        if (password == null || password.length() < 8) return false;
        boolean hasUpper   = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower   = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit   = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.chars().anyMatch(c -> "!@#$%^&*()_+-=[]{}|;':\",./<>?".indexOf(c) >= 0);
        return hasUpper && hasLower && hasDigit && hasSpecial;
    }

    // Inner DTO for registration
    public static class RegisterRequest {
        @jakarta.validation.constraints.NotBlank(message = "Le login est obligatoire")
        @jakarta.validation.constraints.Size(min = 3, max = 50)
        private String login;

        @jakarta.validation.constraints.NotBlank(message = "L'email est obligatoire")
        @jakarta.validation.constraints.Email(message = "Format email invalide")
        private String email;

        @jakarta.validation.constraints.NotBlank(message = "Le mot de passe est obligatoire")
        @jakarta.validation.constraints.Size(min = 8, message = "Au moins 8 caractères")
        private String password;

        private String captchaToken;

        public String getLogin() { return login; }
        public void setLogin(String l) { this.login = l; }
        public String getEmail() { return email; }
        public void setEmail(String e) { this.email = e; }
        public String getPassword() { return password; }
        public void setPassword(String p) { this.password = p; }
        public String getCaptchaToken() { return captchaToken; }
        public void setCaptchaToken(String c) { this.captchaToken = c; }
    }
}

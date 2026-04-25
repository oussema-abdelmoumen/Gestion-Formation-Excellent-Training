package tn.isi.gestionformation.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "utilisateur")
@Data
@NoArgsConstructor
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Le login est obligatoire")
    @Size(min = 3, max = 50, message = "Le login doit avoir entre 3 et 50 caractères")
    @Column(nullable = false, unique = true, length = 50)
    private String login;

    @Column(nullable = false, length = 255)
    private String password;

    @Email(message = "Format email invalide (ex: nom@domaine.com)")
    @NotBlank(message = "L'email est obligatoire")
    @Column(unique = true, length = 150)
    private String email;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_role", nullable = false)
    private Role role;

    // Email verification
    @Column(name = "email_verifie", nullable = false)
    private boolean emailVerifie = false;

    @Column(name = "token_verification", length = 100)
    private String tokenVerification;

    @Column(name = "actif", nullable = false)
    private boolean actif = false;
}

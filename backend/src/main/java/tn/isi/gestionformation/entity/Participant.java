package tn.isi.gestionformation.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "participant")
@Data
@NoArgsConstructor
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit avoir entre 2 et 100 caractères")
    @Pattern(regexp = "^[a-zA-ZÀ-ÿ\\s\\-']+$", message = "Le nom ne doit contenir que des lettres")
    @Column(nullable = false, length = 100)
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 100, message = "Le prénom doit avoir entre 2 et 100 caractères")
    @Pattern(regexp = "^[a-zA-ZÀ-ÿ\\s\\-']+$", message = "Le prénom ne doit contenir que des lettres")
    @Column(nullable = false, length = 100)
    private String prenom;

    @Email(message = "Format email invalide (ex: nom@domaine.com)")
    @Column(length = 150)
    private String email;

    @Pattern(regexp = "^(\\+?[0-9]{8,15})?$", message = "Numéro de téléphone invalide (8-15 chiffres)")
    @Column(length = 20)
    private String tel;

    @NotNull(message = "La structure est obligatoire")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_structure", nullable = false)
    private Structure structure;

    @NotNull(message = "Le profil est obligatoire")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_profil", nullable = false)
    private Profil profil;
}

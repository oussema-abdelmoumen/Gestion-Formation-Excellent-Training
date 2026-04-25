package tn.isi.gestionformation.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "formation")
@Data
@NoArgsConstructor
public class Formation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 3, max = 200, message = "Le titre doit avoir entre 3 et 200 caractères")
    @Column(nullable = false, length = 200)
    private String titre;

    @NotNull(message = "L'année est obligatoire")
    @Min(value = 2000, message = "L'année doit être >= 2000")
    @Max(value = 2100, message = "L'année doit être <= 2100")
    @Column(nullable = false)
    private Integer annee;

    @NotNull(message = "La durée est obligatoire")
    @Min(value = 1, message = "La durée doit être d'au moins 1 jour")
    @Max(value = 365, message = "La durée ne peut pas dépasser 365 jours")
    @Column(nullable = false)
    private Integer duree;

    @DecimalMin(value = "0.0", message = "Le budget ne peut pas être négatif")
    private Double budget;

    @Size(max = 200, message = "Le lieu ne peut pas dépasser 200 caractères")
    @Column(length = 200)
    private String lieu;

    @Column(name = "date_formation")
    private java.time.LocalDate dateFormation;

    @NotNull(message = "Le domaine est obligatoire")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_domaine", nullable = false)
    private Domaine domaine;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_formateur")
    private Formateur formateur;

    // Link to the utilisateur who created this formation
    @Column(name = "created_by_id")
    private Integer createdById;

    // Populated at runtime — not stored in DB
    @Transient
    private String createdByLogin;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "formation_participant",
        joinColumns = @JoinColumn(name = "id_formation"),
        inverseJoinColumns = @JoinColumn(name = "id_participant")
    )
    private Set<Participant> participants = new HashSet<>();
}

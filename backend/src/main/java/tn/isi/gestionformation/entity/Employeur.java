package tn.isi.gestionformation.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity @Table(name = "employeur") @Data @NoArgsConstructor
public class Employeur {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @NotBlank(message = "Le nom de l'employeur est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit avoir entre 2 et 100 caractères")
    @Column(nullable = false, unique = true, length = 100, name = "nom_employeur")
    private String nomEmployeur;
}

package tn.isi.gestionformation.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data; import lombok.NoArgsConstructor;
@Entity @Table(name = "profil") @Data @NoArgsConstructor
public class Profil {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Integer id;
    @NotBlank(message = "Le libellé est obligatoire")
    @Size(min = 2, max = 100, message = "Le libellé doit avoir entre 2 et 100 caractères")
    @Column(nullable = false, unique = true, length = 100) private String libelle;
}

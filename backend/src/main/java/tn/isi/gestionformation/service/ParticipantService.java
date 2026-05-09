package tn.isi.gestionformation.service;

import tn.isi.gestionformation.entity.Participant;
import tn.isi.gestionformation.entity.Structure;
import tn.isi.gestionformation.entity.Profil;
import tn.isi.gestionformation.repository.ParticipantRepository;
import tn.isi.gestionformation.repository.StructureRepository;
import tn.isi.gestionformation.repository.ProfilRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.InputStream;
import java.util.*;

@Service
public class ParticipantService {

    @Autowired
    private ParticipantRepository repository;

    @Autowired
    private StructureRepository structureRepository;

    @Autowired
    private ProfilRepository profilRepository;

    public List<Participant> findAll() {
        return repository.findAll();
    }

    public Participant findById(Integer id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Participant non trouvé avec l'id: " + id));
    }

    public Participant save(Participant entity) {
        return repository.save(entity);
    }

    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Participant non trouvé avec l'id: " + id);
        }
        repository.deleteById(id);
    }

    /**
     * Import participants from Excel file.
     * Expected columns: Nom | Prénom | Email | Téléphone | Structure | Profil
     */
    public Map<String, Object> importFromExcel(MultipartFile file) throws Exception {
        List<Participant> imported = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int rowNum = 0;

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            // Skip header row
            if (rows.hasNext()) rows.next();

            while (rows.hasNext()) {
                Row row = rows.next();
                rowNum = row.getRowNum() + 1;

                try {
                    String nom = getCellString(row, 0);
                    String prenom = getCellString(row, 1);
                    String email = getCellString(row, 2);
                    String tel = getCellString(row, 3);
                    String structureLib = getCellString(row, 4);
                    String profilLib = getCellString(row, 5);

                    if (nom.isEmpty() && prenom.isEmpty()) continue; // skip empty rows

                    if (nom.isEmpty()) { errors.add("Ligne " + rowNum + ": Nom obligatoire"); continue; }
                    if (prenom.isEmpty()) { errors.add("Ligne " + rowNum + ": Prénom obligatoire"); continue; }
                    if (structureLib.isEmpty()) { errors.add("Ligne " + rowNum + ": Structure obligatoire"); continue; }
                    if (profilLib.isEmpty()) { errors.add("Ligne " + rowNum + ": Profil obligatoire"); continue; }

                    // Find or create Structure
                    Structure structure = structureRepository.findAll().stream()
                        .filter(s -> s.getLibelle().equalsIgnoreCase(structureLib))
                        .findFirst()
                        .orElseGet(() -> {
                            Structure s = new Structure();
                            s.setLibelle(structureLib);
                            return structureRepository.save(s);
                        });

                    // Find or create Profil
                    Profil profil = profilRepository.findAll().stream()
                        .filter(p -> p.getLibelle().equalsIgnoreCase(profilLib))
                        .findFirst()
                        .orElseGet(() -> {
                            Profil p = new Profil();
                            p.setLibelle(profilLib);
                            return profilRepository.save(p);
                        });

                    Participant participant = new Participant();
                    participant.setNom(nom);
                    participant.setPrenom(prenom);
                    participant.setEmail(email.isEmpty() ? null : email);
                    participant.setTel(tel.isEmpty() ? null : tel);
                    participant.setStructure(structure);
                    participant.setProfil(profil);

                    imported.add(repository.save(participant));
                } catch (Exception e) {
                    errors.add("Ligne " + rowNum + ": " + e.getMessage());
                }
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("imported", imported.size());
        result.put("errors", errors);
        result.put("total", rowNum);
        return result;
    }

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue().trim();
            case NUMERIC: return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            default: return "";
        }
    }
}

package tn.isi.gestionformation.service;

import tn.isi.gestionformation.entity.Formateur;
import tn.isi.gestionformation.entity.Employeur;
import tn.isi.gestionformation.repository.FormateurRepository;
import tn.isi.gestionformation.repository.EmployeurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.InputStream;
import java.util.*;

@Service
public class FormateurService {

    @Autowired
    private FormateurRepository repository;

    @Autowired
    private EmployeurRepository employeurRepository;

    public List<Formateur> findAll() {
        return repository.findAll();
    }

    public Formateur findById(Integer id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Formateur non trouvé avec l'id: " + id));
    }

    public Formateur save(Formateur entity) {
        return repository.save(entity);
    }

    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Formateur non trouvé avec l'id: " + id);
        }
        repository.deleteById(id);
    }

    /**
     * Import formateurs from Excel file.
     * Expected columns: Nom | Prénom | Email | Téléphone | Type | Employeur
     */
    public Map<String, Object> importFromExcel(MultipartFile file) throws Exception {
        List<Formateur> imported = new ArrayList<>();
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
                    String type = getCellString(row, 4).toUpperCase();
                    String employeurNom = getCellString(row, 5);

                    if (nom.isEmpty() && prenom.isEmpty()) continue; // skip empty rows

                    if (nom.isEmpty()) { errors.add("Ligne " + rowNum + ": Nom obligatoire"); continue; }
                    if (prenom.isEmpty()) { errors.add("Ligne " + rowNum + ": Prénom obligatoire"); continue; }
                    if (type.isEmpty()) { errors.add("Ligne " + rowNum + ": Type obligatoire (INTERNE/EXTERNE)"); continue; }
                    if (!type.equals("INTERNE") && !type.equals("EXTERNE")) {
                        errors.add("Ligne " + rowNum + ": Type doit être INTERNE ou EXTERNE (trouvé: " + type + ")");
                        continue;
                    }

                    Formateur formateur = new Formateur();
                    formateur.setNom(nom);
                    formateur.setPrenom(prenom);
                    formateur.setEmail(email.isEmpty() ? null : email);
                    formateur.setTel(tel.isEmpty() ? null : tel);
                    formateur.setType(type);

                    // Handle employeur for EXTERNE type
                    if (type.equals("EXTERNE") && !employeurNom.isEmpty()) {
                        Employeur employeur = employeurRepository.findAll().stream()
                            .filter(e -> e.getNomEmployeur().equalsIgnoreCase(employeurNom))
                            .findFirst()
                            .orElseGet(() -> {
                                Employeur e = new Employeur();
                                e.setNomEmployeur(employeurNom);
                                return employeurRepository.save(e);
                            });
                        formateur.setEmployeur(employeur);
                    }

                    imported.add(repository.save(formateur));
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

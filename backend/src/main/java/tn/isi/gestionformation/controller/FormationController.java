package tn.isi.gestionformation.controller;

import tn.isi.gestionformation.entity.Formation;
import tn.isi.gestionformation.entity.Participant;
import tn.isi.gestionformation.service.FormationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.io.ByteArrayOutputStream;
import java.util.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.*;

@RestController
@RequestMapping("/api/formations")
@CrossOrigin(origins = "http://localhost:4200")
public class FormationController {

    @Autowired
    private FormationService service;

    @GetMapping
    public List<Formation> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Formation> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<Formation> create(@Valid @RequestBody Formation formation) {
        return ResponseEntity.ok(service.save(formation));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Formation> update(@PathVariable Long id, @Valid @RequestBody Formation formation) {
        formation.setId(id);
        return ResponseEntity.ok(service.save(formation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats/domaine")
    public Map<String, Long> statsByDomaine() { return service.countByDomaine(); }

    @GetMapping("/stats/annee")
    public Map<Integer, Long> statsByAnnee() { return service.countByAnnee(); }

    @GetMapping("/stats/budget")
    public Map<String, Double> statsBudget() { return service.budgetByDomaine(); }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel() throws Exception {
        List<Formation> formations = service.findAll();
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet("Formations");

            // Header style
            XSSFCellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte)63, (byte)81, (byte)181}, null));
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            XSSFFont headerFont = workbook.createFont();
            headerFont.setColor(new XSSFColor(new byte[]{(byte)255,(byte)255,(byte)255}, null));
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setBorderBottom(BorderStyle.THIN);

            // Create header row
            String[] headers = {"ID", "Titre", "Année", "Durée (j)", "Budget (DT)", "Domaine", "Formateur", "Lieu", "Date", "Nb Participants", "Participants"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000);
            }
            sheet.setColumnWidth(1, 8000);
            sheet.setColumnWidth(10, 12000);

            // Data rows
            XSSFCellStyle evenStyle = workbook.createCellStyle();
            evenStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte)232,(byte)234,(byte)246}, null));
            evenStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            int rowNum = 1;
            for (Formation f : formations) {
                Row row = sheet.createRow(rowNum);
                if (rowNum % 2 == 0) {
                    for (int i = 0; i < headers.length; i++) row.createCell(i).setCellStyle(evenStyle);
                }
                row.createCell(0).setCellValue(f.getId() != null ? f.getId() : 0);
                row.createCell(1).setCellValue(f.getTitre() != null ? f.getTitre() : "");
                row.createCell(2).setCellValue(f.getAnnee() != null ? f.getAnnee() : 0);
                row.createCell(3).setCellValue(f.getDuree() != null ? f.getDuree() : 0);
                row.createCell(4).setCellValue(f.getBudget() != null ? f.getBudget() : 0);
                row.createCell(5).setCellValue(f.getDomaine() != null ? f.getDomaine().getLibelle() : "");
                row.createCell(6).setCellValue(f.getFormateur() != null ? f.getFormateur().getPrenom() + " " + f.getFormateur().getNom() : "N/A");
                row.createCell(7).setCellValue(f.getLieu() != null ? f.getLieu() : "");
                row.createCell(8).setCellValue(f.getDateFormation() != null ? f.getDateFormation().toString() : "");
                int nbPart = f.getParticipants() != null ? f.getParticipants().size() : 0;
                row.createCell(9).setCellValue(nbPart);
                StringBuilder participants = new StringBuilder();
                if (f.getParticipants() != null) {
                    for (Participant p : f.getParticipants()) {
                        if (participants.length() > 0) participants.append(", ");
                        participants.append(p.getPrenom()).append(" ").append(p.getNom());
                    }
                }
                row.createCell(10).setCellValue(participants.toString());
                rowNum++;
            }

            workbook.write(out);
            byte[] bytes = out.toByteArray();

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=formations.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(bytes.length)
                .body(bytes);
        }
    }

    @GetMapping("/by-user/{userId}")
    public List<Formation> getByUser(@PathVariable Integer userId) {
        return service.findByUserId(userId);
    }

}
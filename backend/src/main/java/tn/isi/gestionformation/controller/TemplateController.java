package tn.isi.gestionformation.controller;

import org.apache.poi.xssf.usermodel.*;
import org.apache.poi.ss.usermodel.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayOutputStream;

@RestController
@RequestMapping("/api/templates")
@CrossOrigin(origins = "http://localhost:4200")
public class TemplateController {

    @GetMapping("/participants")
    public ResponseEntity<byte[]> downloadParticipantsTemplate() throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet("Participants");

            XSSFCellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte)0, (byte)180, (byte)216}, null));
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            XSSFFont headerFont = workbook.createFont();
            headerFont.setColor(new XSSFColor(new byte[]{(byte)255,(byte)255,(byte)255}, null));
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short)12);
            headerStyle.setFont(headerFont);

            String[] headers = {"Nom", "Prénom", "Email", "Téléphone", "Structure", "Profil"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5500);
            }

            String[][] data = {
                {"Ben Ali",    "Mohamed",  "mohamed.benali@email.com",     "98123456", "Direction Générale", "Ingénieur"},
                {"Trabelsi",   "Fatma",    "fatma.trabelsi@email.com",     "97654321", "Ressources Humaines", "Technicien"},
                {"Gharbi",     "Ahmed",    "ahmed.gharbi@email.com",       "96111222", "Direction Technique", "Cadre"},
                {"Mansouri",   "Sarra",    "sarra.mansouri@email.com",     "95333444", "Service Informatique", "Ingénieur"},
                {"Hamdi",      "Karim",    "karim.hamdi@email.com",        "94555666", "Direction Financière", "Comptable"},
                {"Jaziri",     "Amina",    "amina.jaziri@email.com",       "93777888", "Ressources Humaines", "Cadre"},
                {"Bouazizi",   "Yassine",  "yassine.bouazizi@email.com",   "92999000", "Direction Technique", "Technicien"},
                {"Mejri",      "Ines",     "ines.mejri@email.com",         "91222333", "Service Informatique", "Ingénieur"},
                {"Saidi",      "Omar",     "omar.saidi@email.com",         "90444555", "Direction Générale", "Cadre"},
                {"Belhadj",    "Nour",     "nour.belhadj@email.com",       "99666777", "Direction Financière", "Comptable"}
            };

            XSSFCellStyle evenStyle = workbook.createCellStyle();
            evenStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte)240,(byte)248,(byte)255}, null));
            evenStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            for (int i = 0; i < data.length; i++) {
                Row row = sheet.createRow(i + 1);
                for (int j = 0; j < data[i].length; j++) {
                    Cell cell = row.createCell(j);
                    cell.setCellValue(data[i][j]);
                    if (i % 2 == 1) cell.setCellStyle(evenStyle);
                }
            }

            workbook.write(out);
            byte[] bytes = out.toByteArray();
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=exemple_participants.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(bytes.length)
                .body(bytes);
        }
    }

    @GetMapping("/formateurs")
    public ResponseEntity<byte[]> downloadFormateursTemplate() throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet("Formateurs");

            XSSFCellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte)124, (byte)77, (byte)255}, null));
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            XSSFFont headerFont = workbook.createFont();
            headerFont.setColor(new XSSFColor(new byte[]{(byte)255,(byte)255,(byte)255}, null));
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short)12);
            headerStyle.setFont(headerFont);

            String[] headers = {"Nom", "Prénom", "Email", "Téléphone", "Type", "Employeur"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5500);
            }

            String[][] data = {
                {"Chaabane",   "Nabil",    "nabil.chaabane@greenbuilding.tn",  "98111222", "INTERNE", ""},
                {"Bouzid",     "Leila",    "leila.bouzid@greenbuilding.tn",    "97333444", "INTERNE", ""},
                {"Karray",     "Slim",     "slim.karray@techcorp.tn",          "96555666", "EXTERNE", "TechCorp Tunisia"},
                {"Hammami",    "Rim",      "rim.hammami@formation-pro.tn",     "95777888", "EXTERNE", "Formation Pro"},
                {"Maatoug",    "Hedi",     "hedi.maatoug@greenbuilding.tn",    "94999000", "INTERNE", ""},
                {"Ben Salem",  "Olfa",     "olfa.bensalem@consulting.tn",      "93222111", "EXTERNE", "Consulting Plus"},
                {"Oueslati",   "Raouf",    "raouf.oueslati@greenbuilding.tn",  "92444333", "INTERNE", ""},
                {"Ferchichi",  "Marwa",    "marwa.ferchichi@digital.tn",       "91666555", "EXTERNE", "Digital Academy"}
            };

            XSSFCellStyle evenStyle = workbook.createCellStyle();
            evenStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte)245,(byte)240,(byte)255}, null));
            evenStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            for (int i = 0; i < data.length; i++) {
                Row row = sheet.createRow(i + 1);
                for (int j = 0; j < data[i].length; j++) {
                    Cell cell = row.createCell(j);
                    cell.setCellValue(data[i][j]);
                    if (i % 2 == 1) cell.setCellStyle(evenStyle);
                }
            }

            workbook.write(out);
            byte[] bytes = out.toByteArray();
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=exemple_formateurs.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(bytes.length)
                .body(bytes);
        }
    }

    @GetMapping("/formations")
    public ResponseEntity<byte[]> downloadFormationsTemplate() throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet("Formations");

            XSSFCellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte)63, (byte)81, (byte)181}, null));
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            XSSFFont headerFont = workbook.createFont();
            headerFont.setColor(new XSSFColor(new byte[]{(byte)255,(byte)255,(byte)255}, null));
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short)12);
            headerStyle.setFont(headerFont);

            String[] headers = {"Titre", "Année", "Durée (jours)", "Budget (DT)", "Lieu", "Date Formation", "Domaine", "Formateur Email", "Participants Emails"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, i == 0 ? 8000 : (i == 8 ? 12000 : 5500));
            }

            String[][] data = {
                {"Formation Java Avancé",       "2024", "5",  "3500", "Tunis",    "2024-03-15", "Informatique",  "nabil.chaabane@greenbuilding.tn", "mohamed.benali@email.com; fatma.trabelsi@email.com; ahmed.gharbi@email.com"},
                {"Gestion de Projet PMP",        "2024", "10", "5000", "Sfax",     "2024-06-20", "Management",    "leila.bouzid@greenbuilding.tn",   "sarra.mansouri@email.com; karim.hamdi@email.com"},
                {"Excel & Data Analysis",        "2024", "3",  "1500", "Sousse",   "2024-09-10", "Finance",       "slim.karray@techcorp.tn",         "amina.jaziri@email.com; yassine.bouazizi@email.com; ines.mejri@email.com"},
                {"Cybersécurité Fondamentaux",   "2025", "4",  "4000", "Tunis",    "2025-02-05", "Informatique",  "rim.hammami@formation-pro.tn",    "omar.saidi@email.com; nour.belhadj@email.com"},
                {"Communication & Leadership",   "2025", "2",  "2000", "Bizerte",  "2025-04-18", "Développement personnel", "nouveau.formateur@email.com", "nouveau.participant@email.com; autre.participant@email.com"},
            };

            XSSFCellStyle evenStyle = workbook.createCellStyle();
            evenStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte)232,(byte)234,(byte)246}, null));
            evenStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Add a note row
            XSSFCellStyle noteStyle = workbook.createCellStyle();
            noteStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte)255,(byte)255,(byte)230}, null));
            noteStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            XSSFFont noteFont = workbook.createFont();
            noteFont.setItalic(true);
            noteFont.setFontHeightInPoints((short)9);
            noteStyle.setFont(noteFont);

            for (int i = 0; i < data.length; i++) {
                Row row = sheet.createRow(i + 1);
                for (int j = 0; j < data[i].length; j++) {
                    Cell cell = row.createCell(j);
                    cell.setCellValue(data[i][j]);
                    if (i % 2 == 1) cell.setCellStyle(evenStyle);
                }
            }

            // Add note row
            Row noteRow = sheet.createRow(data.length + 2);
            Cell noteCell = noteRow.createCell(0);
            noteCell.setCellValue("NOTE: Les formateurs et participants inconnus seront créés automatiquement. Séparer les emails participants par ; ou ,");
            noteCell.setCellStyle(noteStyle);

            workbook.write(out);
            byte[] bytes = out.toByteArray();
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=exemple_formations.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(bytes.length)
                .body(bytes);
        }
    }
}

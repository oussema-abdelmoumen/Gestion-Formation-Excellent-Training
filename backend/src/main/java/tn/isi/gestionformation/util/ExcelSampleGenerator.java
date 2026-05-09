package tn.isi.gestionformation.util;

import org.apache.poi.xssf.usermodel.*;
import org.apache.poi.ss.usermodel.*;
import java.io.FileOutputStream;

/**
 * Utility to generate sample Excel files for import.
 * Run this class directly to create the files in the project root.
 * 
 * Usage: java tn.isi.gestionformation.util.ExcelSampleGenerator
 */
public class ExcelSampleGenerator {

    public static void main(String[] args) throws Exception {
        generateParticipantsExcel("exemple_participants.xlsx");
        generateFormateursExcel("exemple_formateurs.xlsx");
        System.out.println("✅ Fichiers Excel générés avec succès!");
    }

    public static void generateParticipantsExcel(String filename) throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Participants");

            // Header style
            XSSFCellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte)0, (byte)180, (byte)216}, null));
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            XSSFFont headerFont = workbook.createFont();
            headerFont.setColor(new XSSFColor(new byte[]{(byte)255,(byte)255,(byte)255}, null));
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short)12);
            headerStyle.setFont(headerFont);

            // Headers
            String[] headers = {"Nom", "Prénom", "Email", "Téléphone", "Structure", "Profil"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5500);
            }

            // Sample data
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

            try (FileOutputStream fos = new FileOutputStream(filename)) {
                workbook.write(fos);
            }
            System.out.println("✅ " + filename + " créé avec " + data.length + " participants");
        }
    }

    public static void generateFormateursExcel(String filename) throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Formateurs");

            // Header style
            XSSFCellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte)124, (byte)77, (byte)255}, null));
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            XSSFFont headerFont = workbook.createFont();
            headerFont.setColor(new XSSFColor(new byte[]{(byte)255,(byte)255,(byte)255}, null));
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short)12);
            headerStyle.setFont(headerFont);

            // Headers
            String[] headers = {"Nom", "Prénom", "Email", "Téléphone", "Type", "Employeur"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5500);
            }

            // Sample data
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

            try (FileOutputStream fos = new FileOutputStream(filename)) {
                workbook.write(fos);
            }
            System.out.println("✅ " + filename + " créé avec " + data.length + " formateurs");
        }
    }
}

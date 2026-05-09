package tn.isi.gestionformation.service;

import tn.isi.gestionformation.entity.*;
import tn.isi.gestionformation.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FormationService {

    @Autowired private FormationRepository formationRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private DomaineRepository domaineRepository;
    @Autowired private FormateurRepository formateurRepository;
    @Autowired private ParticipantRepository participantRepository;
    @Autowired private StructureRepository structureRepository;
    @Autowired private ProfilRepository profilRepository;

    public List<Formation> findAll() {
        return formationRepository.findAll().stream()
            .peek(this::populateLogin).collect(Collectors.toList());
    }

    public List<Formation> findByUserId(Integer userId) {
        return formationRepository.findAll().stream()
            .filter(f -> f.getCreatedById() != null && f.getCreatedById().equals(userId))
            .peek(this::populateLogin).collect(Collectors.toList());
    }

    private void populateLogin(Formation f) {
        if (f.getCreatedById() != null) {
            utilisateurRepository.findById(f.getCreatedById())
                .ifPresent(u -> f.setCreatedByLogin(u.getLogin()));
        }
    }

    public Formation findById(Long id) {
        Formation f = formationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Formation non trouvée"));
        populateLogin(f);
        return f;
    }

    public Formation save(Formation formation) { return formationRepository.save(formation); }
    public void delete(Long id) { formationRepository.deleteById(id); }

    // ════════════════════════════════════════════════════════════════
    //  IMPORT FROM EXCEL
    // ════════════════════════════════════════════════════════════════
    /**
     * Expected Excel columns:
     * Titre | Année | Durée | Budget | Lieu | Date Formation | Domaine | Formateur Email | Participants Emails
     *
     * - Domaine: auto-created if not found
     * - Formateur: looked up by email. If not found → auto-created with name from email, added to "autoCreated" list
     * - Participants: emails separated by comma/semicolon. If not found → auto-created, added to "autoCreated" list
     */
    public Map<String, Object> importFromExcel(MultipartFile file) throws Exception {
        List<Map<String, Object>> importedList = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        List<String> autoCreatedFormateurs = new ArrayList<>();
        List<String> autoCreatedParticipants = new ArrayList<>();
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
                    String titre = getCellString(row, 0);
                    String anneeStr = getCellString(row, 1);
                    String dureeStr = getCellString(row, 2);
                    String budgetStr = getCellString(row, 3);
                    String lieu = getCellString(row, 4);
                    String dateStr = getCellString(row, 5);
                    String domaineLib = getCellString(row, 6);
                    String formateurEmail = getCellString(row, 7);
                    String participantsEmails = getCellString(row, 8);

                    if (titre.isEmpty()) continue; // skip empty rows

                    // Validate required fields
                    if (titre.length() < 3) { errors.add("Ligne " + rowNum + ": Titre trop court (min 3 car.)"); continue; }
                    if (anneeStr.isEmpty()) { errors.add("Ligne " + rowNum + ": Année obligatoire"); continue; }
                    if (dureeStr.isEmpty()) { errors.add("Ligne " + rowNum + ": Durée obligatoire"); continue; }
                    if (domaineLib.isEmpty()) { errors.add("Ligne " + rowNum + ": Domaine obligatoire"); continue; }

                    int annee;
                    try { annee = Integer.parseInt(anneeStr.replaceAll("\\.0$", "")); }
                    catch (NumberFormatException e) { errors.add("Ligne " + rowNum + ": Année invalide '" + anneeStr + "'"); continue; }

                    int duree;
                    try { duree = Integer.parseInt(dureeStr.replaceAll("\\.0$", "")); }
                    catch (NumberFormatException e) { errors.add("Ligne " + rowNum + ": Durée invalide '" + dureeStr + "'"); continue; }

                    Double budget = null;
                    if (!budgetStr.isEmpty()) {
                        try { budget = Double.parseDouble(budgetStr.replaceAll("[^0-9.,]", "").replace(",", ".")); }
                        catch (NumberFormatException e) { errors.add("Ligne " + rowNum + ": Budget invalide '" + budgetStr + "'"); continue; }
                    }

                    // Parse date
                    LocalDate dateFormation = null;
                    if (!dateStr.isEmpty()) {
                        try {
                            // Try multiple date formats
                            dateFormation = tryParseDate(dateStr);
                            if (dateFormation == null) {
                                errors.add("Ligne " + rowNum + ": Format de date invalide '" + dateStr + "'");
                                continue;
                            }
                        } catch (Exception e) {
                            errors.add("Ligne " + rowNum + ": Date invalide '" + dateStr + "'");
                            continue;
                        }
                    }

                    // Find or create Domaine
                    Domaine domaine = domaineRepository.findAll().stream()
                        .filter(d -> d.getLibelle().equalsIgnoreCase(domaineLib))
                        .findFirst()
                        .orElseGet(() -> {
                            Domaine d = new Domaine();
                            d.setLibelle(domaineLib);
                            return domaineRepository.save(d);
                        });

                    // Find or create Formateur by email
                    Formateur formateur = null;
                    if (!formateurEmail.isEmpty()) {
                        formateur = formateurRepository.findAll().stream()
                            .filter(f -> formateurEmail.equalsIgnoreCase(f.getEmail()))
                            .findFirst()
                            .orElse(null);

                        if (formateur == null) {
                            // Auto-create formateur from email
                            formateur = new Formateur();
                            String[] nameParts = formateurEmail.split("@")[0].split("[._-]");
                            formateur.setNom(nameParts.length > 1 ? capitalize(nameParts[1]) : "Inconnu");
                            formateur.setPrenom(capitalize(nameParts[0]));
                            formateur.setEmail(formateurEmail);
                            formateur.setType("EXTERNE");
                            formateur = formateurRepository.save(formateur);
                            autoCreatedFormateurs.add(formateurEmail + " → " + formateur.getPrenom() + " " + formateur.getNom());
                        }
                    }

                    // Find or create Participants by emails
                    Set<Participant> participants = new HashSet<>();
                    if (!participantsEmails.isEmpty()) {
                        String[] emails = participantsEmails.split("[,;\\s]+");
                        for (String pEmail : emails) {
                            pEmail = pEmail.trim();
                            if (pEmail.isEmpty()) continue;

                            final String emailLower = pEmail.toLowerCase();
                            Participant participant = participantRepository.findAll().stream()
                                .filter(p -> emailLower.equalsIgnoreCase(p.getEmail()))
                                .findFirst()
                                .orElse(null);

                            if (participant == null) {
                                // Auto-create participant from email
                                participant = new Participant();
                                String[] nameParts = emailLower.split("@")[0].split("[._-]");
                                participant.setNom(nameParts.length > 1 ? capitalize(nameParts[1]) : "Inconnu");
                                participant.setPrenom(capitalize(nameParts[0]));
                                participant.setEmail(emailLower);

                                // Assign default structure and profil
                                Structure defaultStructure = structureRepository.findAll().stream()
                                    .findFirst()
                                    .orElseGet(() -> {
                                        Structure s = new Structure();
                                        s.setLibelle("Non défini");
                                        return structureRepository.save(s);
                                    });
                                Profil defaultProfil = profilRepository.findAll().stream()
                                    .findFirst()
                                    .orElseGet(() -> {
                                        Profil p = new Profil();
                                        p.setLibelle("Non défini");
                                        return profilRepository.save(p);
                                    });

                                participant.setStructure(defaultStructure);
                                participant.setProfil(defaultProfil);
                                participant = participantRepository.save(participant);
                                autoCreatedParticipants.add(emailLower + " → " + participant.getPrenom() + " " + participant.getNom());
                            }
                            participants.add(participant);
                        }
                    }

                    // Build Formation
                    Formation formation = new Formation();
                    formation.setTitre(titre);
                    formation.setAnnee(annee);
                    formation.setDuree(duree);
                    formation.setBudget(budget);
                    formation.setLieu(lieu.isEmpty() ? null : lieu);
                    formation.setDateFormation(dateFormation);
                    formation.setDomaine(domaine);
                    formation.setFormateur(formateur);
                    formation.setParticipants(participants);

                    Formation saved = formationRepository.save(formation);

                    Map<String, Object> info = new LinkedHashMap<>();
                    info.put("id", saved.getId());
                    info.put("titre", saved.getTitre());
                    importedList.add(info);

                } catch (Exception e) {
                    errors.add("Ligne " + rowNum + ": " + e.getMessage());
                }
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("imported", importedList.size());
        result.put("formations", importedList);
        result.put("errors", errors);
        result.put("autoCreatedFormateurs", autoCreatedFormateurs);
        result.put("autoCreatedParticipants", autoCreatedParticipants);
        return result;
    }

    private LocalDate tryParseDate(String dateStr) {
        // Remove .0 suffix from numeric dates
        dateStr = dateStr.replaceAll("\\.0$", "").trim();

        DateTimeFormatter[] formatters = {
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("yyyy/MM/dd"),
            DateTimeFormatter.ofPattern("d/M/yyyy"),
            DateTimeFormatter.ofPattern("M/d/yyyy"),
        };

        for (DateTimeFormatter fmt : formatters) {
            try { return LocalDate.parse(dateStr, fmt); } catch (Exception ignored) {}
        }

        // Try Excel numeric date (days since 1900-01-01)
        try {
            long days = Long.parseLong(dateStr);
            if (days > 30000 && days < 100000) {
                return LocalDate.of(1899, 12, 30).plusDays(days);
            }
        } catch (NumberFormatException ignored) {}

        return null;
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    java.util.Date date = cell.getDateCellValue();
                    return new java.text.SimpleDateFormat("yyyy-MM-dd").format(date);
                }
                double d = cell.getNumericCellValue();
                if (d == Math.floor(d)) return String.valueOf((long) d);
                return String.valueOf(d);
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            default: return "";
        }
    }

    // ─── Helper: get formations filtered by year (or all if year is null) ───
    private List<Formation> getFormations(Integer annee) {
        List<Formation> all = formationRepository.findAll();
        if (annee != null) {
            return all.stream().filter(f -> f.getAnnee().equals(annee)).collect(Collectors.toList());
        }
        return all;
    }

    // ─── Stats: count by domaine (optionally filtered by year) ───
    public Map<String, Long> countByDomaine(Integer annee) {
        Map<String, Long> result = new LinkedHashMap<>();
        getFormations(annee).forEach(f -> {
            String domaine = f.getDomaine() != null ? f.getDomaine().getLibelle() : "Non défini";
            result.merge(domaine, 1L, Long::sum);
        });
        return result;
    }

    public Map<String, Long> countByDomaine() {
        return countByDomaine(null);
    }

    // ─── Stats: count by année ───
    public Map<Integer, Long> countByAnnee() {
        Map<Integer, Long> result = new LinkedHashMap<>();
        formationRepository.findAll().forEach(f -> result.merge(f.getAnnee(), 1L, Long::sum));
        return result;
    }

    // ─── Stats: budget by domaine (optionally filtered by year) ───
    public Map<String, Double> budgetByDomaine(Integer annee) {
        Map<String, Double> result = new LinkedHashMap<>();
        getFormations(annee).forEach(f -> {
            String domaine = f.getDomaine() != null ? f.getDomaine().getLibelle() : "Non défini";
            result.merge(domaine, f.getBudget() != null ? f.getBudget() : 0.0, Double::sum);
        });
        return result;
    }

    public Map<String, Double> budgetByDomaine() {
        return budgetByDomaine(null);
    }

    // ─── Stats: count by structure ───
    public Map<String, Long> countByStructure() {
        Map<String, Long> result = new LinkedHashMap<>();
        formationRepository.findAll().forEach(f -> {
            if (f.getParticipants() != null) {
                f.getParticipants().forEach(p -> {
                    String structure = p.getStructure() != null ? p.getStructure().getLibelle() : "Non défini";
                    result.merge(structure, 1L, Long::sum);
                });
            }
        });
        return result;
    }

    // ─── Stats: count by formateur (optionally filtered by year) ───
    public Map<String, Long> countByFormateur(Integer annee) {
        Map<String, Long> result = new LinkedHashMap<>();
        getFormations(annee).forEach(f -> {
            String formateur = f.getFormateur() != null
                ? f.getFormateur().getPrenom() + " " + f.getFormateur().getNom()
                : "Non assigné";
            result.merge(formateur, 1L, Long::sum);
        });
        return result;
    }

    // ─── Stats: budget total by année ───
    public Map<Integer, Double> budgetByAnnee() {
        Map<Integer, Double> result = new TreeMap<>();
        formationRepository.findAll().forEach(f -> {
            result.merge(f.getAnnee(), f.getBudget() != null ? f.getBudget() : 0.0, Double::sum);
        });
        return result;
    }

    // ─── Stats: total participants by année ───
    public Map<Integer, Long> participantsByAnnee() {
        Map<Integer, Long> result = new TreeMap<>();
        formationRepository.findAll().forEach(f -> {
            long nbParticipants = f.getParticipants() != null ? f.getParticipants().size() : 0;
            result.merge(f.getAnnee(), nbParticipants, Long::sum);
        });
        return result;
    }

    // ─── Stats: average participants by domaine ───
    public Map<String, Double> avgParticipantsByDomaine() {
        Map<String, List<Integer>> temp = new LinkedHashMap<>();
        formationRepository.findAll().forEach(f -> {
            String domaine = f.getDomaine() != null ? f.getDomaine().getLibelle() : "Non défini";
            int nbPart = f.getParticipants() != null ? f.getParticipants().size() : 0;
            temp.computeIfAbsent(domaine, k -> new ArrayList<>()).add(nbPart);
        });
        Map<String, Double> result = new LinkedHashMap<>();
        temp.forEach((domaine, counts) -> {
            double avg = counts.stream().mapToInt(i -> i).average().orElse(0);
            result.put(domaine, Math.round(avg * 100.0) / 100.0);
        });
        return result;
    }

    // ─── Stats: formations grouped by exact date for a specific year (zoom) ───
    public Map<String, Long> formationsByDate(Integer annee) {
        Map<String, Long> result = new TreeMap<>();
        List<Formation> formations = annee != null
            ? formationRepository.findAll().stream()
                .filter(f -> f.getAnnee().equals(annee))
                .collect(Collectors.toList())
            : formationRepository.findAll();

        formations.forEach(f -> {
            String date = f.getDateFormation() != null
                ? f.getDateFormation().toString()
                : "Non datée";
            result.merge(date, 1L, Long::sum);
        });
        return result;
    }

    // ─── Stats: durée moyenne par domaine ───
    public Map<String, Double> avgDureeByDomaine() {
        Map<String, List<Integer>> temp = new LinkedHashMap<>();
        formationRepository.findAll().forEach(f -> {
            String domaine = f.getDomaine() != null ? f.getDomaine().getLibelle() : "Non défini";
            temp.computeIfAbsent(domaine, k -> new ArrayList<>()).add(f.getDuree());
        });
        Map<String, Double> result = new LinkedHashMap<>();
        temp.forEach((domaine, durees) -> {
            double avg = durees.stream().mapToInt(i -> i).average().orElse(0);
            result.put(domaine, Math.round(avg * 100.0) / 100.0);
        });
        return result;
    }
}

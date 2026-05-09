import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormationService } from '../../core/services/formation.service';
import { DomaineService } from '../../core/services/domaine.service';
import { FormateurService } from '../../core/services/formateur.service';
import { ParticipantService } from '../../core/services/participant.service';
import { AuthService } from '../../core/services/auth.service';
import { Formation, Domaine, Formateur, Participant } from '../../shared/models';

@Component({
  selector:'app-formations',
  templateUrl:'./formations.component.html',
  styleUrls:['./formations.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0', overflow: 'hidden' })),
      state('expanded', style({ height: '*', overflow: 'visible' })),
      transition('expanded <=> collapsed', animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class FormationsComponent implements OnInit {
  items: Formation[] = [];
  filtered: Formation[] = [];
  domaines: Domaine[] = [];
  formateurs: Formateur[] = [];
  allParticipants: Participant[] = [];

  showForm = false; editing = false; showDetail = false;
  selectedFormation: Formation | null = null;
  searchText = ''; filterDomaine = ''; filterAnnee = '';
  annees: number[] = [];
  exportLoading = false;
  importLoading = false;
  importResult: any = null; // stores import result for alert display

  current: Formation = this.empty();
  formErrors: any = {};

  // Search inside dropdowns
  formateurSearch = '';
  participantSearch = '';

  // Role flags
  canCRUD   = false;  // ADMIN + UTILISATEUR : créer/modifier/supprimer
  isReadOnly = false; // RESPONSABLE : lecture seule

  get displayedColumns() {
    const base = ['id','titre','annee','duree','budget','domaine','lieu','dateFormation','formateur','participants'];
    const withOwner = !this.auth.isUtilisateur() ? [...base, 'deposePar'] : base;
    return this.canCRUD ? [...withOwner, 'actions'] : [...withOwner, 'detail'];
  }

  // Filtered lists for dropdowns
  get filteredFormateurs(): Formateur[] {
    if (!this.formateurSearch.trim()) return this.formateurs;
    const s = this.formateurSearch.toLowerCase();
    return this.formateurs.filter(f =>
      f.nom.toLowerCase().includes(s) ||
      f.prenom.toLowerCase().includes(s) ||
      (f.email || '').toLowerCase().includes(s) ||
      f.type.toLowerCase().includes(s)
    );
  }

  get filteredParticipants(): Participant[] {
    if (!this.participantSearch.trim()) return this.allParticipants;
    const s = this.participantSearch.toLowerCase();
    return this.allParticipants.filter(p =>
      p.nom.toLowerCase().includes(s) ||
      p.prenom.toLowerCase().includes(s) ||
      (p.email || '').toLowerCase().includes(s) ||
      (p.structure?.libelle || '').toLowerCase().includes(s) ||
      (p.profil?.libelle || '').toLowerCase().includes(s)
    );
  }

  constructor(
    private service: FormationService, private domSvc: DomaineService,
    private fmtSvc: FormateurService, private parSvc: ParticipantService,
    private snack: MatSnackBar, public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.canCRUD   = this.auth.isAdmin() || this.auth.isUtilisateur();
    this.isReadOnly = this.auth.isResponsable();
    this.load();
    this.domSvc.getAll().subscribe(d => this.domaines = d);
    this.fmtSvc.getAll().subscribe(f => this.formateurs = f);
    this.parSvc.getAll().subscribe(p => this.allParticipants = p);
  }

  empty(): Formation {
    return { titre:'', annee:new Date().getFullYear(), duree:1, domaine:{libelle:''}, participants:[], lieu:'', dateFormation:'' };
  }

  load() {
    const obs = this.auth.isUtilisateur()
      ? this.service.getByUserId(this.auth.getUserId() || 0)
      : this.service.getAll();

    obs.subscribe((d: Formation[]) => {
      this.items = d;
      this.annees = [...new Set(d.map(f => f.annee))].sort((a,b) => b-a);
      this.applyFilters();
    });
  }

  applyFilters() {
    let res = [...this.items];
    if (this.searchText.trim()) {
      const s = this.searchText.toLowerCase();
      res = res.filter(f => f.titre.toLowerCase().includes(s)
        || (f.domaine?.libelle||'').toLowerCase().includes(s)
        || (f.lieu||'').toLowerCase().includes(s)
        || (f.formateur ? (f.formateur.prenom + ' ' + f.formateur.nom).toLowerCase().includes(s) : false)
        || (f.dateFormation||'').toLowerCase().includes(s)
        || String(f.annee).includes(s)
        || String(f.duree).includes(s)
        || String(f.budget || '').includes(s)
        || (f.participants || []).some(p => (p.prenom + ' ' + p.nom).toLowerCase().includes(s))
        || (f.createdByLogin || '').toLowerCase().includes(s)
      );
    }
    if (this.filterDomaine) res = res.filter(f => f.domaine?.id == +this.filterDomaine);
    if (this.filterAnnee)   res = res.filter(f => f.annee == +this.filterAnnee);
    this.filtered = res;
  }

  // Reference to the form card for auto-scroll
  @ViewChild('formCard') formCard!: ElementRef;

  openForm(item?: Formation) {
    if (!this.canCRUD) return;
    this.showForm = true; this.showDetail = false; this.editing = !!item; this.formErrors = {};
    this.formateurSearch = '';
    this.participantSearch = '';
    this.current = item
      ? { ...item, participants: item.participants ? [...item.participants] : [] }
      : this.empty();
    setTimeout(() => this.formCard?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  }

  cancel() { this.showForm = false; this.showDetail = false; this.formErrors = {}; }
  viewDetail(item: Formation) { this.selectedFormation = item; this.showDetail = true; this.showForm = false; }
  compareById(a: any, b: any): boolean { return a && b ? a.id === b.id : a === b; }

  goToParticipant(p: Participant) {
    this.router.navigate(['/app/participants'], { queryParams: { id: p.id } });
  }

  // Keep dropdown open when typing in search
  onSearchKeydown(event: KeyboardEvent) {
    event.stopPropagation();
  }

  validateField(field: string): string {
    const v = (this.current as any)[field];
    switch(field) {
      case 'titre':
        if (!v?.trim()) return 'Le titre est obligatoire';
        if (v.trim().length < 3) return 'Le titre doit avoir au moins 3 caractères';
        if (v.length > 200) return 'Le titre ne peut pas dépasser 200 caractères';
        return '';
      case 'annee':
        if (!v) return 'L\'année est obligatoire';
        if (v < 2000 || v > 2100) return 'L\'année doit être entre 2000 et 2100';
        return '';
      case 'duree':
        if (!v) return 'La durée est obligatoire';
        if (v < 1) return 'La durée doit être d\'au moins 1 jour';
        if (v > 365) return 'La durée ne peut pas dépasser 365 jours';
        return '';
      case 'budget':
        if (v !== null && v !== undefined && v !== '' && v < 0) return 'Le budget ne peut pas être négatif';
        return '';
      case 'lieu':
        if (v && v.length > 200) return 'Le lieu ne peut pas dépasser 200 caractères';
        return '';
      case 'domaine':
        if (!v?.id) return 'Le domaine est obligatoire';
        return '';
      case 'dateFormation':
        if (v && this.current.annee) {
          const dateYear = new Date(v).getFullYear();
          if (dateYear !== this.current.annee) {
            return 'L\'année de la date (' + dateYear + ') doit correspondre à l\'année sélectionnée (' + this.current.annee + ')';
          }
        }
        return '';
      default: return '';
    }
  }

  validateAll(): boolean {
    this.formErrors = {};
    const fields = ['titre','annee','duree','budget','lieu','domaine','dateFormation'];
    let valid = true;
    fields.forEach(f => {
      const err = this.validateField(f);
      if (err) { this.formErrors[f] = err; valid = false; }
    });
    return valid;
  }

  onFieldBlur(field: string) {
    const err = this.validateField(field);
    if (err) this.formErrors[field] = err;
    else delete this.formErrors[field];
    // Cross-validate date when year changes
    if (field === 'annee' && this.current.dateFormation) {
      const dateErr = this.validateField('dateFormation');
      if (dateErr) this.formErrors['dateFormation'] = dateErr;
      else delete this.formErrors['dateFormation'];
    }
  }

  save() {
    if (!this.canCRUD) return;
    if (!this.validateAll()) {
      this.snack.open('❌ Corrigez les erreurs avant de sauvegarder', 'X', {duration:3500});
      return;
    }
    if (!this.editing) {
      this.current.createdById = this.auth.getUserId() || undefined;
    }
    const obs = this.editing && this.current.id
      ? this.service.update(this.current.id!, this.current)
      : this.service.create(this.current);
    obs.subscribe({
      next: () => { this.load(); this.cancel(); this.snack.open('✅ Enregistré avec succès!', '', {duration:2500}); },
      error: (e) => this.snack.open('❌ ' + (e.error?.message || JSON.stringify(e.error)), 'X', {duration:4000})
    });
  }

  delete(id: number) {
    if (!this.canCRUD) return;
    if (!confirm('Supprimer cette formation ?')) return;
    this.service.delete(id).subscribe({
      next: () => { this.load(); this.snack.open('🗑️ Supprimé', '', {duration:2000}); },
      error: () => this.snack.open('❌ Erreur lors de la suppression', 'X', {duration:3000})
    });
  }

  exportExcel() {
    this.exportLoading = true;
    this.service.exportExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'formations.xlsx'; a.click();
        window.URL.revokeObjectURL(url); this.exportLoading = false;
        this.snack.open('✅ Export Excel téléchargé!', '', {duration:2500});
      },
      error: () => { this.exportLoading = false; this.snack.open('❌ Erreur export', 'X', {duration:3000}); }
    });
  }

  // ─── Excel Import ───
  onImportFile(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.xlsx')) {
      this.snack.open('❌ Le fichier doit être au format .xlsx', 'X', {duration:3500});
      return;
    }
    this.importLoading = true;
    this.importResult = null;
    this.service.importExcel(file).subscribe({
      next: (result) => {
        this.importLoading = false;
        this.importResult = result;

        // Simple snack for quick feedback
        const msg = `✅ ${result.imported} formation(s) importée(s)`;
        this.snack.open(msg, 'OK', {duration:4000});

        // Reload data
        this.load();
        this.fmtSvc.getAll().subscribe(f => this.formateurs = f);
        this.parSvc.getAll().subscribe(p => this.allParticipants = p);

        event.target.value = '';
      },
      error: (e) => {
        this.importLoading = false;
        this.snack.open('❌ ' + (e.error?.error || 'Erreur import'), 'X', {duration:4000});
        event.target.value = '';
      }
    });
  }

  dismissImportResult() { this.importResult = null; }
}

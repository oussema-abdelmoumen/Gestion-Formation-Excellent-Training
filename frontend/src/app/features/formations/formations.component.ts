import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormationService } from '../../core/services/formation.service';
import { DomaineService } from '../../core/services/domaine.service';
import { FormateurService } from '../../core/services/formateur.service';
import { ParticipantService } from '../../core/services/participant.service';
import { AuthService } from '../../core/services/auth.service';
import { Formation, Domaine, Formateur, Participant } from '../../shared/models';

@Component({ selector:'app-formations', templateUrl:'./formations.component.html', styleUrls:['./formations.component.css'] })
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

  current: Formation = this.empty();
  formErrors: any = {};

  // Role flags
  canCRUD   = false;  // ADMIN + UTILISATEUR : créer/modifier/supprimer
  isReadOnly = false; // RESPONSABLE : lecture seule

  get displayedColumns() {
    const base = ['id','titre','annee','duree','budget','domaine','lieu','dateFormation','formateur','participants'];
    const withOwner = !this.auth.isUtilisateur() ? [...base, 'deposePar'] : base;
    return this.canCRUD ? [...withOwner, 'actions'] : [...withOwner, 'detail'];
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
        || (f.lieu||'').toLowerCase().includes(s));
    }
    if (this.filterDomaine) res = res.filter(f => f.domaine?.id == +this.filterDomaine);
    if (this.filterAnnee)   res = res.filter(f => f.annee == +this.filterAnnee);
    this.filtered = res;
  }

  openForm(item?: Formation) {
    if (!this.canCRUD) return;
    this.showForm = true; this.showDetail = false; this.editing = !!item; this.formErrors = {};
    this.current = item
      ? { ...item, participants: item.participants ? [...item.participants] : [] }
      : this.empty();
  }

  cancel() { this.showForm = false; this.showDetail = false; this.formErrors = {}; }
  viewDetail(item: Formation) { this.selectedFormation = item; this.showDetail = true; this.showForm = false; }
  compareById(a: any, b: any): boolean { return a && b ? a.id === b.id : a === b; }

  goToParticipant(p: Participant) {
    this.router.navigate(['/app/participants'], { queryParams: { id: p.id } });
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
      default: return '';
    }
  }

  validateAll(): boolean {
    this.formErrors = {};
    const fields = ['titre','annee','duree','budget','lieu','domaine'];
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
}

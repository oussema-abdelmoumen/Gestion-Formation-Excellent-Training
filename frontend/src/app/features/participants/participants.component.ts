import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ParticipantService } from '../../core/services/participant.service';
import { StructureService } from '../../core/services/structure.service';
import { ProfilService } from '../../core/services/profil.service';
import { FormationService } from '../../core/services/formation.service';
import { AuthService } from '../../core/services/auth.service';
import { Participant, Structure, Profil, Formation } from '../../shared/models';

@Component({
  selector:'app-participants',
  templateUrl:'./participants.component.html',
  styleUrls:['./participants.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0', overflow: 'hidden' })),
      state('expanded', style({ height: '*', overflow: 'visible' })),
      transition('expanded <=> collapsed', animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ParticipantsComponent implements OnInit {
  items: Participant[] = [];
  filtered: Participant[] = [];
  structures: Structure[] = [];
  profils: Profil[] = [];
  allFormations: Formation[] = [];

  showForm = false;
  editing = false;
  formErrors: any = {};
  isReadOnly = false;  // seulement RESPONSABLE
  searchText = '';
  importLoading = false;

  expandedId: number | null = null;
  participantFormations: { [id: number]: Formation[] } = {};

  // Multi-select
  selectedIds = new Set<number>();

  current: Participant = this.empty();

  get displayedColumns() {
    const base = ['select','id','nom','prenom','email','tel','structure','profil','formations'];
    return this.isReadOnly ? base.filter(c => c !== 'select') : [...base, 'actions'];
  }

  constructor(
    private svc: ParticipantService,
    private strSvc: StructureService,
    private prfSvc: ProfilService,
    private fmtSvc: FormationService,
    private snack: MatSnackBar,
    private route: ActivatedRoute,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.isReadOnly = this.auth.isResponsable();   // UTILISATEUR peut modifier
    this.load();
    this.strSvc.getAll().subscribe(s => this.structures = s);
    this.prfSvc.getAll().subscribe(p => this.profils = p);
    this.fmtSvc.getAll().subscribe(f => {
      this.allFormations = f;
      this.buildParticipantFormations();
    });
    this.route.queryParams.subscribe(params => {
      if (params['id']) this.expandedId = +params['id'];
    });
  }

  empty(): Participant { return { nom:'', prenom:'', email:'', tel:'', structure:{libelle:''}, profil:{libelle:''} }; }

  load() {
    this.svc.getAll().subscribe(d => {
      this.items = d;
      this.buildParticipantFormations();
      this.applyFilters();
    });
  }

  applyFilters() {
    if (!this.searchText.trim()) {
      this.filtered = [...this.items];
      return;
    }
    const s = this.searchText.toLowerCase();
    this.filtered = this.items.filter(p =>
      p.nom.toLowerCase().includes(s) ||
      p.prenom.toLowerCase().includes(s) ||
      (p.email || '').toLowerCase().includes(s) ||
      (p.tel || '').toLowerCase().includes(s) ||
      (p.structure?.libelle || '').toLowerCase().includes(s) ||
      (p.profil?.libelle || '').toLowerCase().includes(s) ||
      String(p.id || '').includes(s)
    );
  }

  buildParticipantFormations() {
    this.participantFormations = {};
    this.items.forEach(p => {
      if (p.id) {
        this.participantFormations[p.id] = this.allFormations.filter(f =>
          f.participants?.some((fp: any) => fp.id === p.id)
        );
      }
    });
  }

  getFormationsForParticipant(participantId: number): Formation[] {
    return this.participantFormations[participantId] || [];
  }

  toggleDetail(id: number) { this.expandedId = this.expandedId === id ? null : id; }

  openForm(item?: Participant) {
    if (this.isReadOnly) return;
    this.showForm = true; this.editing = !!item; this.formErrors = {};
    this.expandedId = null;
    this.current = item ? { ...item } : this.empty();
  }
  cancel() { this.showForm = false; this.formErrors = {}; }
  compareById(a: any, b: any): boolean { return a && b ? a.id === b.id : a === b; }

  validateField(field: string): string {
    const v = (this.current as any)[field];
    switch(field) {
      case 'nom':
        if (!v?.trim()) return 'Le nom est obligatoire';
        if (v.trim().length < 2) return 'Minimum 2 caractères';
        if (v.length > 100) return 'Maximum 100 caractères';
        if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(v)) return 'Lettres uniquement';
        return '';
      case 'prenom':
        if (!v?.trim()) return 'Le prénom est obligatoire';
        if (v.trim().length < 2) return 'Minimum 2 caractères';
        if (v.length > 100) return 'Maximum 100 caractères';
        if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(v)) return 'Lettres uniquement';
        return '';
      case 'email':
        if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Format invalide (ex: nom@domaine.com)';
        return '';
      case 'tel':
        if (v && !/^[\+]?[0-9]{8,15}$/.test(v.replace(/\s/g,''))) return 'Numéro invalide (8-15 chiffres)';
        return '';
      case 'structure': if (!v?.id) return 'La structure est obligatoire'; return '';
      case 'profil':    if (!v?.id) return 'Le profil est obligatoire'; return '';
      default: return '';
    }
  }

  onBlur(field: string) {
    const err = this.validateField(field);
    if (err) this.formErrors[field] = err; else delete this.formErrors[field];
  }

  validateAll(): boolean {
    this.formErrors = {};
    let valid = true;
    ['nom','prenom','email','tel','structure','profil'].forEach(f => {
      const err = this.validateField(f);
      if (err) { this.formErrors[f] = err; valid = false; }
    });
    return valid;
  }

  save() {
    if (this.isReadOnly) return;
    if (!this.validateAll()) { this.snack.open('❌ Corrigez les erreurs du formulaire', 'X', {duration:3500}); return; }
    const obs = this.editing && this.current.id
      ? this.svc.update(this.current.id!, this.current)
      : this.svc.create(this.current);
    obs.subscribe({
      next: () => { this.load(); this.cancel(); this.snack.open('✅ Enregistré!', '', {duration:2500}); },
      error: (e) => this.snack.open('❌ ' + (e.error?.message || 'Erreur serveur'), 'X', {duration:4000})
    });
  }

  delete(id: number) {
    if (this.isReadOnly) return;
    if (!confirm('Supprimer ce participant ?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.load(); this.snack.open('🗑️ Supprimé', '', {duration:2000}); },
      error: () => this.snack.open('❌ Impossible de supprimer', 'X', {duration:3000})
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
    this.svc.importExcel(file).subscribe({
      next: (result) => {
        this.importLoading = false;
        const msg = `✅ ${result.imported} participant(s) importé(s)`;
        const errMsg = result.errors?.length ? ` — ${result.errors.length} erreur(s)` : '';
        this.snack.open(msg + errMsg, 'OK', {duration:5000});
        if (result.errors?.length) {
          console.warn('Import errors:', result.errors);
        }
        this.load();
        event.target.value = '';
      },
      error: (e) => {
        this.importLoading = false;
        this.snack.open('❌ ' + (e.error?.error || 'Erreur import'), 'X', {duration:4000});
        event.target.value = '';
      }
    });
  }

  // ─── Multi-select ───
  toggleSelection(id: number) {
    this.selectedIds.has(id) ? this.selectedIds.delete(id) : this.selectedIds.add(id);
  }

  isSelected(id: number): boolean { return this.selectedIds.has(id); }

  toggleAll() {
    if (this.selectedIds.size === this.filtered.length) {
      this.selectedIds.clear();
    } else {
      this.filtered.forEach(p => { if (p.id) this.selectedIds.add(p.id); });
    }
  }

  get allSelected(): boolean {
    return this.filtered.length > 0 && this.selectedIds.size === this.filtered.length;
  }

  deleteSelected() {
    if (this.selectedIds.size === 0) return;
    const count = this.selectedIds.size;
    if (!confirm(`Supprimer ${count} participant(s) sélectionné(s) ?`)) return;
    this.svc.deleteBulk([...this.selectedIds]).subscribe({
      next: (result) => {
        this.snack.open(`🗑️ ${result.deleted} participant(s) supprimé(s)`, '', {duration:3000});
        this.selectedIds.clear();
        this.load();
      },
      error: () => this.snack.open('❌ Erreur lors de la suppression', 'X', {duration:3000})
    });
  }
}
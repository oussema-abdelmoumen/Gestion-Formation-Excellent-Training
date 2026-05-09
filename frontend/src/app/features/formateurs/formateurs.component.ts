import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormateurService } from '../../core/services/formateur.service';
import { EmployeurService } from '../../core/services/employeur.service';
import { AuthService } from '../../core/services/auth.service';
import { Formateur, Employeur } from '../../shared/models';

@Component({ selector:'app-formateurs', templateUrl:'./formateurs.component.html', styleUrls:['./formateurs.component.css'] })
export class FormateursComponent implements OnInit {
  items: Formateur[] = [];
  filtered: Formateur[] = [];
  employeurs: Employeur[] = [];
  showForm = false; editing = false;
  current: Formateur = this.empty();
  formErrors: any = {};
  isReadOnly = false;
  searchText = '';
  importLoading = false;

  // Multi-select
  selectedIds = new Set<number>();

  get displayedColumns() {
    const base = ['select','id','nom','prenom','email','tel','type','employeur'];
    return this.isReadOnly ? base.filter(c => c !== 'select') : [...base, 'actions'];
  }

  constructor(
    private svc: FormateurService,
    private empSvc: EmployeurService,
    private snack: MatSnackBar,
    public auth: AuthService
  ) {}

  ngOnInit() {
    // ADMIN et UTILISATEUR peuvent ajouter/modifier/supprimer. RESPONSABLE = lecture seule.
    this.isReadOnly = this.auth.isResponsable();
    this.load();
    this.empSvc.getAll().subscribe(e => this.employeurs = e);
  }

  empty(): Formateur { return { nom:'', prenom:'', email:'', tel:'', type:'INTERNE' }; }

  load() {
    this.svc.getAll().subscribe(d => {
      this.items = d;
      this.applyFilters();
    });
  }

  applyFilters() {
    if (!this.searchText.trim()) {
      this.filtered = [...this.items];
      return;
    }
    const s = this.searchText.toLowerCase();
    this.filtered = this.items.filter(f =>
      f.nom.toLowerCase().includes(s) ||
      f.prenom.toLowerCase().includes(s) ||
      (f.email || '').toLowerCase().includes(s) ||
      (f.tel || '').toLowerCase().includes(s) ||
      f.type.toLowerCase().includes(s) ||
      (f.employeur?.nomEmployeur || '').toLowerCase().includes(s) ||
      String(f.id || '').includes(s)
    );
  }

  openForm(item?: Formateur) {
    if (this.isReadOnly) return;
    this.showForm = true; this.editing = !!item; this.formErrors = {};
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
      case 'type':
        if (!v) return 'Le type est obligatoire';
        if (!['INTERNE','EXTERNE'].includes(v)) return 'Type: INTERNE ou EXTERNE';
        return '';
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
    ['nom','prenom','email','tel','type'].forEach(f => {
      const err = this.validateField(f);
      if (err) { this.formErrors[f] = err; valid = false; }
    });
    return valid;
  }

  save() {
    if (this.isReadOnly) return;
    if (!this.validateAll()) { this.snack.open('❌ Corrigez les erreurs', 'X', {duration:3500}); return; }
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
    if (!confirm('Supprimer ce formateur ?')) return;
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
        const msg = `✅ ${result.imported} formateur(s) importé(s)`;
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
      this.filtered.forEach(f => { if (f.id) this.selectedIds.add(f.id); });
    }
  }

  get allSelected(): boolean {
    return this.filtered.length > 0 && this.selectedIds.size === this.filtered.length;
  }

  deleteSelected() {
    if (this.selectedIds.size === 0) return;
    const count = this.selectedIds.size;
    if (!confirm(`Supprimer ${count} formateur(s) sélectionné(s) ?`)) return;
    this.svc.deleteBulk([...this.selectedIds]).subscribe({
      next: (result) => {
        this.snack.open(`🗑️ ${result.deleted} formateur(s) supprimé(s)`, '', {duration:3000});
        this.selectedIds.clear();
        this.load();
      },
      error: () => this.snack.open('❌ Erreur lors de la suppression', 'X', {duration:3000})
    });
  }
}

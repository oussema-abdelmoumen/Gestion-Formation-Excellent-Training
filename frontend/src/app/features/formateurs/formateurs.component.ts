import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormateurService } from '../../core/services/formateur.service';
import { EmployeurService } from '../../core/services/employeur.service';
import { AuthService } from '../../core/services/auth.service';
import { Formateur, Employeur } from '../../shared/models';

@Component({ selector:'app-formateurs', templateUrl:'./formateurs.component.html', styleUrls:['./formateurs.component.css'] })
export class FormateursComponent implements OnInit {
  items: Formateur[] = [];
  employeurs: Employeur[] = [];
  showForm = false; editing = false;
  current: Formateur = this.empty();
  formErrors: any = {};
  isReadOnly = false;

  get displayedColumns() {
    const base = ['id','nom','prenom','email','tel','type','employeur'];
    return this.isReadOnly ? base : [...base, 'actions'];
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
  load() { this.svc.getAll().subscribe(d => this.items = d); }

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
}

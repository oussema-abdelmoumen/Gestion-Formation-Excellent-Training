import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfilService } from '../../core/services/profil.service';
import { AuthService } from '../../core/services/auth.service';
import { Profil } from '../../shared/models';

@Component({
  selector: 'app-profils',
  templateUrl: './profils.component.html',
  styleUrls: ['./profils.component.css']
})
export class ProfilsComponent implements OnInit {
  items: Profil[] = [];
  showForm = false;
  editing = false;
  current: Profil = { libelle: '' };
  isReadOnly = false;

  get displayedColumns() {
    return this.isReadOnly ? ['id', 'libelle'] : ['id', 'libelle', 'actions'];
  }

  constructor(
    private service: ProfilService,
    private snack: MatSnackBar,
    public auth: AuthService
  ) {}

  ngOnInit() {
    // UTILISATEUR = consultation uniquement. ADMIN = accès complet.
    this.isReadOnly = this.auth.isUtilisateur();
    this.load();
  }

  load() { this.service.getAll().subscribe(data => this.items = data); }

  openForm(item?: Profil) {
    if (this.isReadOnly) return;
    this.showForm = true;
    if (item) { this.editing = true; this.current = { ...item }; }
    else { this.editing = false; this.current = { libelle: '' }; }
  }

  cancel() { this.showForm = false; }

  save() {
    if (this.isReadOnly) return;
    if (!this.current.libelle?.trim()) {
      this.snack.open('Le champ est obligatoire !', 'Fermer', {duration: 3000});
      return;
    }
    const obs = this.editing && this.current.id
      ? this.service.update(this.current.id!, this.current)
      : this.service.create(this.current);
    obs.subscribe({
      next: () => { this.load(); this.cancel(); this.snack.open('Enregistré avec succès', '', {duration: 2000}); },
      error: (e) => this.snack.open('Erreur: ' + (e.error?.message || e.message), 'Fermer', {duration: 4000})
    });
  }

  delete(id: number) {
    if (this.isReadOnly) return;
    if (!confirm('Confirmer la suppression ?')) return;
    this.service.delete(id).subscribe({
      next: () => { this.load(); this.snack.open('Supprimé', '', {duration: 2000}); },
      error: () => this.snack.open('Impossible de supprimer (utilisé ailleurs)', 'Fermer', {duration: 4000})
    });
  }
}

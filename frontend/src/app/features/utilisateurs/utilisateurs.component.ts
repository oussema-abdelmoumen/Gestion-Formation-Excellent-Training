import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { RoleService } from '../../core/services/role.service';
import { Utilisateur, Role } from '../../shared/models';

@Component({ selector: 'app-utilisateurs', templateUrl: './utilisateurs.component.html', styleUrls: ['./utilisateurs.component.css'] })
export class UtilisateursComponent implements OnInit {
  items: Utilisateur[] = [];
  roles: Role[] = [];
  showForm = false; editing = false;
  current: Utilisateur = { login: '', password: '', role: { id: 3, nom: 'UTILISATEUR' } };
  displayedColumns = ['id', 'login', 'role', 'actions'];

  constructor(private service: UtilisateurService, private roleSvc: RoleService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); this.roleSvc.getAll().subscribe(r => this.roles = r); }
  load() { this.service.getAll().subscribe(d => this.items = d); }
  openForm(item?: Utilisateur) {
    this.showForm = true; this.editing = !!item;
    this.current = item ? { ...item, password: '' } : { login: '', password: '', role: { id: 3, nom: 'UTILISATEUR' } };
  }
  cancel() { this.showForm = false; }
  compareById(a: any, b: any): boolean { return a && b ? a.id === b.id : a === b; }
  save() {
    if (!this.current.login?.trim()) { this.snack.open('Login obligatoire!', 'X', {duration:3000}); return; }
    if (!this.editing && !this.current.password?.trim()) { this.snack.open('Mot de passe obligatoire!', 'X', {duration:3000}); return; }
    const obs = this.editing && this.current.id ? this.service.update(this.current.id!, this.current) : this.service.create(this.current);
    obs.subscribe({ next: () => { this.load(); this.cancel(); this.snack.open('Enregistré!', '', {duration:2000}); }, error: (e) => this.snack.open('Erreur: ' + (e.error?.message || 'Erreur'), 'X', {duration:4000}) });
  }
  delete(id: number) {
    if (!confirm('Supprimer cet utilisateur?')) return;
    this.service.delete(id).subscribe({ next: () => { this.load(); this.snack.open('Supprimé', '', {duration:2000}); }, error: () => this.snack.open('Erreur', 'X', {duration:3000}) });
  }
}

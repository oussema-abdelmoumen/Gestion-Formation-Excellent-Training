import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeurService } from '../../core/services/employeur.service';
import { Employeur } from '../../shared/models';

@Component({ selector: 'app-employeurs', templateUrl: './employeurs.component.html', styleUrls: ['./employeurs.component.css'] })
export class EmployeursComponent implements OnInit {
  items: Employeur[] = [];
  showForm = false; editing = false;
  current: Employeur = { nomEmployeur: '' };
  displayedColumns = ['id', 'nomEmployeur', 'actions'];

  constructor(private service: EmployeurService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); }
  load() { this.service.getAll().subscribe(d => this.items = d); }
  openForm(item?: Employeur) {
    this.showForm = true;
    this.editing = !!item;
    this.current = item ? { ...item } : { nomEmployeur: '' };
  }
  cancel() { this.showForm = false; }
  save() {
    if (!this.current.nomEmployeur?.trim()) { this.snack.open('Nom obligatoire!', 'Fermer', {duration: 3000}); return; }
    const obs = this.editing && this.current.id ? this.service.update(this.current.id!, this.current) : this.service.create(this.current);
    obs.subscribe({ next: () => { this.load(); this.cancel(); this.snack.open('Enregistré!', '', {duration:2000}); }, error: () => this.snack.open('Erreur', 'Fermer', {duration:3000}) });
  }
  delete(id: number) {
    if (!confirm('Supprimer?')) return;
    this.service.delete(id).subscribe({ next: () => { this.load(); this.snack.open('Supprimé', '', {duration:2000}); }, error: () => this.snack.open('Erreur', 'Fermer', {duration:3000}) });
  }
}

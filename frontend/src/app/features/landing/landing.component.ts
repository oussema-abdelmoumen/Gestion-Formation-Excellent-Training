import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  particles: any[] = [];
  scrolled = false;

  features = [
    { icon: 'menu_book',          title: 'Gestion des Formations',    desc: 'Planifiez, organisez et suivez toutes vos sessions de formation en un seul endroit.' },
    { icon: 'groups',             title: 'Suivi des Participants',     desc: 'Gerez les inscriptions, les profils et la progression de chaque participant.' },
    { icon: 'person_pin',         title: 'Gestion des Formateurs',     desc: 'Coordonnez formateurs internes et externes avec leurs specialites et disponibilites.' },
    { icon: 'bar_chart',          title: 'Statistiques et Rapports',   desc: 'Visualisez les indicateurs cles et exportez vos donnees en Excel.' },
    { icon: 'admin_panel_settings', title: 'Controle des Acces',       desc: 'Trois niveaux de roles pour une gestion securisee et cloisonnee.' },
    { icon: 'account_tree',       title: 'Gestion Multi-Structure',    desc: 'Supportez plusieurs directions et structures au sein d\'un seul systeme.' },
  ];

  stats = [
    { value: '100+', label: 'Formations' },
    { value: '3',    label: 'Niveaux d\'acces' },
    { value: '500+', label: 'Participants' },
    { value: '24/7', label: 'Disponibilite' },
  ];

  constructor(public router: Router, public theme: ThemeService) {}

  ngOnInit() { this.generateParticles(); }

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 60; }

  generateParticles() {
    this.particles = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 8,
      duration: Math.random() * 10 + 8,
      opacity: Math.random() * 0.4 + 0.1
    }));
  }

  goToLogin() { this.router.navigate(['/login']); }
}

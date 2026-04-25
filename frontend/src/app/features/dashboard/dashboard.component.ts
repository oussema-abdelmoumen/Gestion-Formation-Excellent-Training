import { Component, OnInit } from '@angular/core';
import { FormationService } from '../../core/services/formation.service';
import { ParticipantService } from '../../core/services/participant.service';
import { FormateurService } from '../../core/services/formateur.service';
import { DomaineService } from '../../core/services/domaine.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { ChartData, ChartOptions } from 'chart.js';

@Component({ selector:'app-dashboard', templateUrl:'./dashboard.component.html', styleUrls:['./dashboard.component.css'] })
export class DashboardComponent implements OnInit {
  totalFormations = 0; totalParticipants = 0; totalFormateurs = 0; totalDomaines = 0;
  login = '';
  summaryItems: {label:string;value:string}[] = [];

  COLORS = ['#00b4d8','#ffd60a','#00e676','#7c4dff','#ff6b6b','#ff9f43','#00cec9','#a29bfe'];

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color:'#8899aa', font:{ family:'Nunito' } } } },
    scales: {
      x: { ticks:{ color:'#8899aa' }, grid:{ color:'rgba(255,255,255,0.04)' } },
      y: { ticks:{ color:'#8899aa' }, grid:{ color:'rgba(255,255,255,0.04)' } }
    }
  };

  domaineChartData: ChartData<'bar'>     = { labels:[], datasets:[{ data:[], label:'', backgroundColor:[] }] };
  anneeChartData:   ChartData<'line'>    = { labels:[], datasets:[{ data:[], label:'', borderColor:'#00b4d8', fill:false }] };
  budgetChartData:  ChartData<'doughnut'>= { labels:[], datasets:[{ data:[], backgroundColor:[] }] };

  constructor(
    private formationSvc: FormationService, private participantSvc: ParticipantService,
    private formateurSvc: FormateurService, private domaineSvc: DomaineService,
    public auth: AuthService, public router: Router
  ) {}

  ngOnInit() {
    this.login = this.auth.getLogin() || 'Utilisateur';

    this.formationSvc.getAll().subscribe(f => {
      this.totalFormations = f.length;
      const totalBudget = f.reduce((s,x) => s+(x.budget||0), 0);
      const totalJours  = f.reduce((s,x) => s+(x.duree||0), 0);
      this.summaryItems = [
        { label:'Formations total',      value:`${this.totalFormations}` },
        { label:'Participants inscrits',  value:`${this.totalParticipants}` },
        { label:'Formateurs actifs',      value:`${this.totalFormateurs}` },
        { label:'Budget total',           value:`${totalBudget.toLocaleString('fr-TN')} DT` },
        { label:'Jours de formation',     value:`${totalJours} j` },
        { label:'Domaines couverts',      value:`${this.totalDomaines}` },
      ];
    });

    this.participantSvc.getAll().subscribe(p => this.totalParticipants = p.length);
    this.formateurSvc.getAll().subscribe(f => this.totalFormateurs = f.length);
    this.domaineSvc.getAll().subscribe(d => this.totalDomaines = d.length);

    this.formationSvc.getStatsByDomaine().subscribe(data => {
      const labels = Object.keys(data);
      this.domaineChartData = { labels, datasets:[{ data:Object.values(data), label:'Formations', backgroundColor:this.COLORS.slice(0,labels.length), borderRadius:6 }] };
    });

    this.formationSvc.getStatsByAnnee().subscribe(data => {
      const sorted = Object.entries(data).sort((a,b) => +a[0]-+b[0]);
      this.anneeChartData = { labels:sorted.map(e=>e[0]), datasets:[{ data:sorted.map(e=>e[1]), label:'Par année', borderColor:'#00b4d8', backgroundColor:'rgba(0,180,216,0.1)', fill:true, tension:0.4, pointBackgroundColor:'#00e5ff', pointRadius:5 }] };
    });

    this.formationSvc.getStatsBudget().subscribe(data => {
      const labels = Object.keys(data);
      this.budgetChartData = { labels, datasets:[{ data:Object.values(data), backgroundColor:this.COLORS.slice(0,labels.length), borderColor:'rgba(5,13,31,.5)', borderWidth:2 }] };
    });
  }

  navigate(path: string) { this.router.navigate([`/app/${path}`]); }
}

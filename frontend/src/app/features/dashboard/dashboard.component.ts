import { Component, OnInit } from '@angular/core';
import { FormationService } from '../../core/services/formation.service';
import { ParticipantService } from '../../core/services/participant.service';
import { FormateurService } from '../../core/services/formateur.service';
import { DomaineService } from '../../core/services/domaine.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { ChartData, ChartOptions } from 'chart.js';
import { Formation, Participant } from '../../shared/models';

@Component({ selector:'app-dashboard', templateUrl:'./dashboard.component.html', styleUrls:['./dashboard.component.css'] })
export class DashboardComponent implements OnInit {
  totalFormations = 0; totalParticipants = 0; totalFormateurs = 0; totalDomaines = 0;
  totalBudget = 0; totalJours = 0;
  login = '';

  // Year filter
  availableYears: number[] = [];
  selectedYear: number | null = null;

  // Zoom state
  zoomedYear: number | null = null;
  isZoomed = false;

  // Tab
  activeTab = 'overview'; // 'overview' | 'budget' | 'participants'

  // Top lists (computed from formations)
  topFormations: {titre: string; count: number}[] = [];
  topFormateurs: {nom: string; count: number}[] = [];
  topParticipants: {nom: string; count: number}[] = [];
  domaineList: {nom: string; count: number; pct: number; color: string}[] = [];

  // Store all formations for year-based filtering of top lists
  private allFormations: Formation[] = [];

  COLORS = ['#00b4d8','#ffd60a','#00e676','#7c4dff','#ff6b6b','#ff9f43','#00cec9','#a29bfe','#fd79a8','#74b9ff','#55efc4','#e17055'];

  // Shared chart config
  areaChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false, callbacks: { afterLabel: () => '🔍 Cliquer pour zoomer' } }
    },
    scales: {
      x: { ticks:{ color:'#556677', font:{ size:10 } }, grid:{ color:'rgba(255,255,255,0.03)' }, border:{ display:false } },
      y: { ticks:{ color:'#556677', font:{ size:10 } }, grid:{ color:'rgba(255,255,255,0.05)' }, border:{ display:false }, beginAtZero: true }
    },
    elements: { line: { tension: 0.4, borderWidth: 2.5 }, point: { radius: 4, hoverRadius: 8 } },
    interaction: { mode: 'nearest', intersect: false }
  };

  barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks:{ color:'#556677', font:{ size:10 } }, grid:{ display: false }, border:{ display:false } },
      y: { ticks:{ color:'#556677', font:{ size:10 } }, grid:{ color:'rgba(255,255,255,0.05)' }, border:{ display:false }, beginAtZero: true }
    }
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const pct = total > 0 ? Math.round((ctx.raw as number) / total * 100) : 0;
            return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
          }
        }
      }
    }
  };

  zoomChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks:{ color:'#556677', font:{ size:9 }, maxRotation: 45 }, grid:{ display: false }, border:{ display:false } },
      y: { ticks:{ color:'#556677', font:{ size:10 } }, grid:{ color:'rgba(255,255,255,0.05)' }, border:{ display:false }, beginAtZero: true }
    }
  };

  // Chart data
  domainePieData: ChartData<'pie'> = { labels:[], datasets:[{ data:[], backgroundColor:[] }] };
  evolutionChartData: ChartData<'line'> = { labels:[], datasets:[] };
  budgetAnneeChartData: ChartData<'line'> = { labels:[], datasets:[] };
  participantsAnneeChartData: ChartData<'line'> = { labels:[], datasets:[] };
  formateurBarData: ChartData<'bar'> = { labels:[], datasets:[] };
  budgetDomaineBarData: ChartData<'bar'> = { labels:[], datasets:[] };
  dateZoomChartData: ChartData<'bar'> = { labels:[], datasets:[] };
  budgetZoomChartData: ChartData<'bar'> = { labels:[], datasets:[] };
  participantsZoomChartData: ChartData<'bar'> = { labels:[], datasets:[] };

  // Zoom state per chart
  budgetZoomed = false; budgetZoomedYear: number | null = null;
  participantsZoomed = false; participantsZoomedYear: number | null = null;

  private anneeLabels: string[] = [];
  private budgetAnneeLabels: string[] = [];
  private participantsAnneeLabels: string[] = [];

  constructor(
    private formationSvc: FormationService, private participantSvc: ParticipantService,
    private formateurSvc: FormateurService, private domaineSvc: DomaineService,
    public auth: AuthService, public router: Router
  ) {}

  ngOnInit() {
    this.login = this.auth.getLogin() || 'Utilisateur';
    this.loadAll();
  }

  loadAll() {
    this.formationSvc.getAll().subscribe(formations => {
      this.allFormations = formations;
      this.totalFormations = formations.length;
      this.availableYears = [...new Set(formations.map(x => x.annee))].sort((a,b) => b-a);
      this.totalBudget = formations.reduce((s,x) => s+(x.budget||0), 0);
      this.totalJours = formations.reduce((s,x) => s+(x.duree||0), 0);
      this.buildTopLists(formations);
    });
    this.participantSvc.getAll().subscribe(p => this.totalParticipants = p.length);
    this.formateurSvc.getAll().subscribe(f => this.totalFormateurs = f.length);
    this.domaineSvc.getAll().subscribe(d => this.totalDomaines = d.length);
    this.loadCharts();
  }

  buildTopLists(formations: Formation[]) {
    // Top 5 formations les plus suivies (by participant count)
    this.topFormations = formations
      .map(f => ({ titre: f.titre, count: f.participants?.length || 0 }))
      .sort((a,b) => b.count - a.count)
      .slice(0, 5);

    // Formations par formateur (top 5)
    const fmtMap: {[k:string]: number} = {};
    formations.forEach(f => {
      const n = f.formateur ? `${f.formateur.prenom} ${f.formateur.nom}` : 'Non assigné';
      fmtMap[n] = (fmtMap[n] || 0) + 1;
    });
    this.topFormateurs = Object.entries(fmtMap).sort((a,b) => b[1]-a[1]).slice(0, 5)
      .map(([nom, count]) => ({ nom, count }));

    // Top 5 most active participants (by number of formations attended)
    const partMap: {[k:string]: number} = {};
    formations.forEach(f => {
      f.participants?.forEach(p => {
        const name = `${p.prenom} ${p.nom}`;
        partMap[name] = (partMap[name] || 0) + 1;
      });
    });
    this.topParticipants = Object.entries(partMap)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nom, count]) => ({ nom, count }));

    // Domaine list with percentages
    const domMap: {[k:string]: number} = {};
    formations.forEach(f => {
      const d = f.domaine?.libelle || 'Non défini';
      domMap[d] = (domMap[d] || 0) + 1;
    });
    const total = formations.length || 1;
    this.domaineList = Object.entries(domMap)
      .sort((a,b) => b[1]-a[1])
      .map(([nom, count], i) => ({
        nom, count,
        pct: Math.round(count / total * 100),
        color: this.COLORS[i % this.COLORS.length]
      }));
  }

  loadCharts(annee?: number) {
    // 1. Formations par domaine (pie)
    this.formationSvc.getStatsByDomaine(annee).subscribe(data => {
      const labels = Object.keys(data);
      this.domainePieData = {
        labels,
        datasets:[{
          data: Object.values(data),
          backgroundColor: this.COLORS.slice(0, labels.length),
          borderColor: '#0d1b2a',
          borderWidth: 2
        }]
      };
    });

    // 2. Évolution par Année (smooth area line — clickable)
    this.formationSvc.getStatsByAnnee().subscribe(data => {
      const sorted = Object.entries(data).sort((a,b) => +a[0]-+b[0]);
      this.anneeLabels = sorted.map(e => e[0]);
      this.evolutionChartData = {
        labels: sorted.map(e => e[0]),
        datasets:[{
          data: sorted.map(e => e[1]),
          label: 'Formations',
          borderColor: '#5b7fff',
          backgroundColor: (ctx: any) => {
            const chart = ctx.chart;
            const { ctx: context, chartArea } = chart;
            if (!chartArea) return 'rgba(91,127,255,0.15)';
            const gradient = context.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(91,127,255,0.35)');
            gradient.addColorStop(1, 'rgba(91,127,255,0.02)');
            return gradient;
          },
          fill: true,
          tension: 0.45,
          pointBackgroundColor: '#5b7fff',
          pointBorderColor: '#0d1b2a',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 9
        }]
      };
    });

    // 3. Budget par Année (smooth area — clickable)
    this.formationSvc.getStatsBudgetByAnnee().subscribe(data => {
      const sorted = Object.entries(data).sort((a,b) => +a[0]-+b[0]);
      this.budgetAnneeLabels = sorted.map(e => e[0]);
      this.budgetAnneeChartData = {
        labels: sorted.map(e => e[0]),
        datasets:[{
          data: sorted.map(e => e[1]),
          label: 'Budget (DT)',
          borderColor: '#ffd60a',
          backgroundColor: (ctx: any) => {
            const chart = ctx.chart;
            const { ctx: context, chartArea } = chart;
            if (!chartArea) return 'rgba(255,214,10,0.15)';
            const gradient = context.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(255,214,10,0.3)');
            gradient.addColorStop(1, 'rgba(255,214,10,0.02)');
            return gradient;
          },
          fill: true,
          tension: 0.45,
          pointBackgroundColor: '#ffd60a',
          pointBorderColor: '#0d1b2a',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 9
        }]
      };
    });

    // 4. Participants par Année (smooth area — clickable)
    this.formationSvc.getStatsParticipantsByAnnee().subscribe(data => {
      const sorted = Object.entries(data).sort((a,b) => +a[0]-+b[0]);
      this.participantsAnneeLabels = sorted.map(e => e[0]);
      this.participantsAnneeChartData = {
        labels: sorted.map(e => e[0]),
        datasets:[{
          data: sorted.map(e => e[1]),
          label: 'Participants',
          borderColor: '#00e676',
          backgroundColor: (ctx: any) => {
            const chart = ctx.chart;
            const { ctx: context, chartArea } = chart;
            if (!chartArea) return 'rgba(0,230,118,0.15)';
            const gradient = context.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(0,230,118,0.3)');
            gradient.addColorStop(1, 'rgba(0,230,118,0.02)');
            return gradient;
          },
          fill: true,
          tension: 0.45,
          pointBackgroundColor: '#00e676',
          pointBorderColor: '#0d1b2a',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 9
        }]
      };
    });

    // 5. Formations par Formateur (bar)
    this.formationSvc.getStatsByFormateur(annee).subscribe(data => {
      const entries = Object.entries(data).sort((a,b) => b[1]-a[1]).slice(0, 8);
      this.formateurBarData = {
        labels: entries.map(e => e[0]),
        datasets:[{
          data: entries.map(e => e[1]),
          label: 'Formations',
          backgroundColor: 'rgba(255,214,10,0.7)',
          borderRadius: 4,
          barThickness: 20
        }]
      };
    });

    // 6. Budget par Domaine (bar horizontal-like)
    this.formationSvc.getStatsBudget(annee).subscribe(data => {
      const entries = Object.entries(data).sort((a,b) => b[1]-a[1]);
      this.budgetDomaineBarData = {
        labels: entries.map(e => e[0]),
        datasets:[{
          data: entries.map(e => e[1]),
          label: 'Budget (DT)',
          backgroundColor: this.COLORS.slice(0, entries.length).map(c => c + 'cc'),
          borderRadius: 4,
          barThickness: 22
        }]
      };
    });
  }

  // ─── Year filter ───
  onYearFilterChange() {
    this.isZoomed = false;
    this.zoomedYear = null;
    // Rebuild top lists with filtered formations
    const filtered = this.selectedYear
      ? this.allFormations.filter(f => f.annee === this.selectedYear)
      : this.allFormations;
    this.buildTopLists(filtered);
    this.loadCharts(this.selectedYear || undefined);
  }

  clearYearFilter() {
    this.selectedYear = null;
    this.isZoomed = false;
    this.zoomedYear = null;
    this.buildTopLists(this.allFormations);
    this.loadCharts();
  }

  // ─── Zoom: Formations evolution ───
  onEvolutionClick(event: any) {
    if (event?.active?.length > 0) {
      const idx = event.active[0].index;
      if (this.anneeLabels[idx]) this.zoomIntoYear(+this.anneeLabels[idx]);
    }
  }

  zoomIntoYear(year: number) {
    this.zoomedYear = year;
    this.isZoomed = true;
    this.formationSvc.getStatsByDate(year).subscribe(data => {
      const sorted = Object.entries(data).sort((a,b) => a[0].localeCompare(b[0]));
      this.dateZoomChartData = {
        labels: sorted.map(e => e[0]),
        datasets:[{
          data: sorted.map(e => e[1]),
          label: `Formations en ${year}`,
          backgroundColor: 'rgba(91,127,255,0.6)',
          borderColor: '#5b7fff',
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 16
        }]
      };
    });
  }

  zoomOut() { this.isZoomed = false; this.zoomedYear = null; }

  // ─── Zoom: Budget curve ───
  onBudgetClick(event: any) {
    if (event?.active?.length > 0) {
      const idx = event.active[0].index;
      const yearStr = this.budgetAnneeLabels[idx];
      if (yearStr) this.zoomIntoBudget(+yearStr);
    }
  }

  zoomIntoBudget(year: number) {
    this.budgetZoomedYear = year;
    this.budgetZoomed = true;
    // Build budget by formation for that year
    const yearFormations = this.allFormations.filter(f => f.annee === year);
    const budgetByFormation = yearFormations
      .filter(f => f.budget && f.budget > 0)
      .sort((a, b) => (b.budget || 0) - (a.budget || 0));
    this.budgetZoomChartData = {
      labels: budgetByFormation.map(f => f.titre.length > 25 ? f.titre.substring(0, 25) + '...' : f.titre),
      datasets: [{
        data: budgetByFormation.map(f => f.budget || 0),
        label: `Budget ${year} (DT)`,
        backgroundColor: 'rgba(255,214,10,0.6)',
        borderColor: '#ffd60a',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 18
      }]
    };
  }

  budgetZoomOut() { this.budgetZoomed = false; this.budgetZoomedYear = null; }

  // ─── Zoom: Participants curve ───
  onParticipantsClick(event: any) {
    if (event?.active?.length > 0) {
      const idx = event.active[0].index;
      const yearStr = this.participantsAnneeLabels[idx];
      if (yearStr) this.zoomIntoParticipants(+yearStr);
    }
  }

  zoomIntoParticipants(year: number) {
    this.participantsZoomedYear = year;
    this.participantsZoomed = true;
    // Build participants count by formation for that year
    const yearFormations = this.allFormations.filter(f => f.annee === year);
    const sorted = yearFormations
      .map(f => ({ titre: f.titre, count: f.participants?.length || 0 }))
      .sort((a, b) => b.count - a.count);
    this.participantsZoomChartData = {
      labels: sorted.map(f => f.titre.length > 25 ? f.titre.substring(0, 25) + '...' : f.titre),
      datasets: [{
        data: sorted.map(f => f.count),
        label: `Participants ${year}`,
        backgroundColor: 'rgba(0,230,118,0.6)',
        borderColor: '#00e676',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 18
      }]
    };
  }

  participantsZoomOut() { this.participantsZoomed = false; this.participantsZoomedYear = null; }

  navigate(path: string) { this.router.navigate([`/app/${path}`]); }
}

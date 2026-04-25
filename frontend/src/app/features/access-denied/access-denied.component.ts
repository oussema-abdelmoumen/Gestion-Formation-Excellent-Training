import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-access-denied',
  template: `
    <div class="denied-container">
      <div class="denied-card">
        <div class="icon-wrap"><mat-icon>block</mat-icon></div>
        <h1>Accès Refusé</h1>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <div class="role-info">
          Votre rôle actuel : <strong>{{ auth.getRole() }}</strong>
        </div>
        <button mat-raised-button color="primary" (click)="router.navigate(['/app/dashboard'])">
          <mat-icon>arrow_back</mat-icon> Retour au tableau de bord
        </button>
      </div>
    </div>
  `,
  styles: [`
    .denied-container{display:flex;justify-content:center;align-items:center;min-height:80vh;padding:32px;}
    .denied-card{text-align:center;max-width:480px;background:rgba(255,68,68,.06);border:1px solid rgba(255,68,68,.25);border-radius:20px;padding:48px 40px;animation:fadeUp .5s ease both;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    .icon-wrap mat-icon{font-size:72px;height:72px;width:72px;color:#ff4444;opacity:.8;display:block;margin:0 auto 20px;}
    h1{font-family:'Josefin Sans',sans-serif;font-size:2rem;color:#e8f1f2;margin-bottom:12px;}
    p{color:#8899aa;font-size:1rem;margin-bottom:20px;line-height:1.6;}
    .role-info{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:12px 20px;margin-bottom:28px;color:#8899aa;font-size:.9rem;}
    .role-info strong{color:#00e5ff;}
  `]
})
export class AccessDeniedComponent {
  constructor(public auth: AuthService, public router: Router) {}
}

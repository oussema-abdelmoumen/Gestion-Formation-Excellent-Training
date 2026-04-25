import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify-email',
  template: `
    <div class="verify-container">
      <div class="verify-card" [class.success]="status==='success'" [class.error]="status==='error'">
        <div class="verify-icon">
          <mat-icon *ngIf="status==='loading'">hourglass_empty</mat-icon>
          <mat-icon *ngIf="status==='success'">verified</mat-icon>
          <mat-icon *ngIf="status==='error'">error_outline</mat-icon>
        </div>
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        <button mat-raised-button color="primary" class="go-btn"
                *ngIf="status!=='loading'" (click)="router.navigate(['/login'])">
          <mat-icon>login</mat-icon> Aller à la connexion
        </button>
      </div>
    </div>
  `,
  styles: [`
    .verify-container{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#050d1f;padding:20px;}
    .verify-card{text-align:center;max-width:460px;width:100%;background:rgba(9,20,40,.9);border-radius:20px;padding:48px 40px;border:1px solid rgba(0,180,216,.25);box-shadow:0 20px 60px rgba(0,0,0,.6);animation:fadeUp .6s ease;}
    .verify-card.success{border-color:rgba(0,230,118,.3);}
    .verify-card.error{border-color:rgba(255,68,68,.3);}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    .verify-icon mat-icon{font-size:72px;height:72px;width:72px;display:block;margin:0 auto 20px;}
    .verify-card.success .verify-icon mat-icon{color:#00e676;}
    .verify-card.error .verify-icon mat-icon{color:#ff4444;}
    .verify-card mat-icon:not(.verify-icon mat-icon){animation:spin 1.5s linear infinite;}
    @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    h2{font-family:'Josefin Sans',sans-serif;font-size:1.8rem;color:#e8f1f2;margin-bottom:12px;}
    p{color:#8899aa;line-height:1.7;margin-bottom:28px;}
    .go-btn{border-radius:12px!important;font-family:'Josefin Sans',sans-serif!important;font-weight:700!important;height:48px;padding:0 28px;}
  `]
})
export class VerifyEmailComponent implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';
  title = 'Vérification en cours...';
  message = 'Veuillez patienter pendant la vérification de votre email.';

  constructor(private route: ActivatedRoute, public router: Router, private http: HttpClient) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status = 'error';
      this.title = 'Token manquant';
      this.message = 'Le lien de vérification est invalide ou incomplet.';
      return;
    }
    this.http.get<any>(`http://localhost:8080/api/auth/verify?token=${token}`).subscribe({
      next: (res) => {
        this.status = 'success';
        this.title = 'Email vérifié !';
        this.message = 'Votre compte est maintenant activé. Vous pouvez vous connecter.';
      },
      error: (err) => {
        this.status = 'error';
        this.title = 'Vérification échouée';
        this.message = err.error?.error || 'Lien invalide ou expiré. Veuillez vous réinscrire.';
      }
    });
  }
}

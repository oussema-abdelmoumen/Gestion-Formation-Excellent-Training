import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  login = ''; password = '';
  errorMessage = ''; hidePassword = true; loading = false;

  constructor(private authService: AuthService) {
    if (this.authService.isLoggedIn()) this.authService.redirectAfterLogin();
  }

  onLogin() {
    if (!this.login.trim() || !this.password.trim()) {
      this.errorMessage = 'Veuillez remplir tous les champs.'; return;
    }
    this.loading = true; this.errorMessage = '';
    this.authService.login({ login: this.login, password: this.password }).subscribe({
      next: () => { this.loading = false; this.authService.redirectAfterLogin(); },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Identifiant ou mot de passe incorrect.';
      }
    });
  }
}

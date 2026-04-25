import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

declare const grecaptcha: any;

// Global callback accessible by reCAPTCHA script
(window as any).onCaptchaSuccess = null;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, AfterViewInit {
  form = { login: '', email: '', password: '', confirmPassword: '' };
  errors: any = {};
  serverError = '';
  successMsg = '';
  loading = false;
  hidePassword = true;
  hideConfirm = true;
  captchaToken = '';
  captchaVerified = false;
  strength = 0;
  strengthLabel = '';
  strengthColor = '';

  // reCAPTCHA site key — test key (always passes)
  private siteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  constructor(private http: HttpClient, private router: Router, private zone: NgZone) {}

  ngOnInit() {
    // Register global callback
    (window as any).onCaptchaSuccess = (token: string) => {
      this.zone.run(() => {
        this.captchaToken = token;
        this.captchaVerified = true;
        this.serverError = '';
      });
    };
    (window as any).onCaptchaExpired = () => {
      this.zone.run(() => {
        this.captchaToken = '';
        this.captchaVerified = false;
      });
    };
  }

  ngAfterViewInit() {
    this.loadAndRenderCaptcha();
  }

  private loadAndRenderCaptcha() {
    const render = () => {
      const container = document.getElementById('recaptcha-container');
      if (container && container.childElementCount === 0) {
        try {
          grecaptcha.render('recaptcha-container', {
            sitekey: this.siteKey,
            callback: 'onCaptchaSuccess',
            'expired-callback': 'onCaptchaExpired',
            theme: 'dark',
            size: 'normal'
          });
        } catch (e) {
          // Already rendered
        }
      }
    };

    if (typeof grecaptcha !== 'undefined' && grecaptcha.render) {
      render();
    } else {
      // Wait for script to load
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (typeof grecaptcha !== 'undefined' && grecaptcha.render) {
          clearInterval(interval);
          render();
        }
        if (attempts > 20) clearInterval(interval);
      }, 500);
    }
  }

  // ✅ Helper methods for template (no inline regex)
  hasUppercase(): boolean { return /[A-Z]/.test(this.form.password); }
  hasDigit(): boolean     { return /[0-9]/.test(this.form.password); }
  hasSpecial(): boolean   { return /[!@#$%^&*()\-_=+\[\]{}|;:,.<>?]/.test(this.form.password); }
  hasMinLength(): boolean { return this.form.password.length >= 8; }

  validateField(field: string) { this.errors[field] = this.getFieldError(field); }

  getFieldError(field: string): string {
    switch (field) {
      case 'login':
        if (!this.form.login) return 'Le login est obligatoire';
        if (this.form.login.length < 3) return 'Minimum 3 caractères';
        if (this.form.login.length > 50) return 'Maximum 50 caractères';
        if (!/^[a-zA-Z0-9_\-.]+$/.test(this.form.login)) return 'Lettres, chiffres, _ - . uniquement';
        return '';
      case 'email':
        if (!this.form.email) return 'L\'email est obligatoire';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) return 'Format invalide (ex: nom@domaine.com)';
        return '';
      case 'password':
        if (!this.form.password) return 'Le mot de passe est obligatoire';
        if (!this.hasMinLength()) return 'Au moins 8 caractères';
        if (!this.hasUppercase()) return 'Au moins une majuscule';
        if (!this.hasDigit()) return 'Au moins un chiffre';
        if (!this.hasSpecial()) return 'Au moins un caractère spécial (!@#$...)';
        return '';
      case 'confirmPassword':
        if (!this.form.confirmPassword) return 'Confirmez votre mot de passe';
        if (this.form.password !== this.form.confirmPassword) return 'Les mots de passe ne correspondent pas';
        return '';
      default: return '';
    }
  }

  checkPasswordStrength() {
    let score = 0;
    if (this.hasMinLength()) score++;
    if (this.form.password.length >= 12) score++;
    if (this.hasUppercase()) score++;
    if (/[a-z]/.test(this.form.password)) score++;
    if (this.hasDigit()) score++;
    if (this.hasSpecial()) score++;
    this.strength = Math.min(score, 5);
    if (score <= 2)      { this.strengthLabel = 'Faible';    this.strengthColor = '#ff4444'; }
    else if (score <= 3) { this.strengthLabel = 'Moyen';     this.strengthColor = '#ffd60a'; }
    else if (score <= 4) { this.strengthLabel = 'Fort';      this.strengthColor = '#00b4d8'; }
    else                 { this.strengthLabel = 'Très fort'; this.strengthColor = '#00e676'; }
    this.validateField('password');
    if (this.form.confirmPassword) this.validateField('confirmPassword');
  }

  isFormValid(): boolean {
    return ['login','email','password','confirmPassword'].every(f => !this.getFieldError(f));
  }

  onSubmit() {
    ['login','email','password','confirmPassword'].forEach(f => this.validateField(f));
    if (!this.isFormValid()) return;
    if (!this.captchaToken) {
      this.serverError = 'Veuillez cocher le CAPTCHA avant de continuer.'; return;
    }
    this.loading = true; this.serverError = '';
    this.http.post<any>('http://localhost:8080/api/auth/register', {
      login: this.form.login,
      email: this.form.email,
      password: this.form.password,
      captchaToken: this.captchaToken
    }).subscribe({
      next: (res) => { this.loading = false; this.successMsg = res.message; },
      error: (err) => {
        this.loading = false;
        this.serverError = err.error?.error || 'Une erreur est survenue.';
        try { grecaptcha.reset(); } catch(e) {}
        this.captchaToken = ''; this.captchaVerified = false;
      }
    });
  }

  goToLogin() { this.router.navigate(['/login']); }
}

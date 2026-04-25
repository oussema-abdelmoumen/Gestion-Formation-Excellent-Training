import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(r => {
        localStorage.setItem('token', r.token);
        localStorage.setItem('role',  r.role);
        localStorage.setItem('login', r.login);
        localStorage.setItem('userId', String(r.id));
      })
    );
  }

  logout(): void { localStorage.clear(); this.router.navigate(['/']); }

  getToken():  string | null { return localStorage.getItem('token'); }
  getRole():   string | null { return localStorage.getItem('role'); }
  getLogin():  string | null { return localStorage.getItem('login'); }
  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? +id : null;
  }
  isLoggedIn(): boolean { return !!this.getToken(); }

  isAdmin():       boolean { return this.getRole() === 'ADMIN'; }
  isUtilisateur(): boolean { return this.getRole() === 'UTILISATEUR'; }
  isResponsable(): boolean { return this.getRole() === 'RESPONSABLE'; }
  hasAnyRole(...roles: string[]): boolean {
    const r = this.getRole(); return r !== null && roles.includes(r);
  }
  canEdit(): boolean  { return this.hasAnyRole('ADMIN','UTILISATEUR'); }
  canAdmin(): boolean { return this.isAdmin(); }

  redirectAfterLogin(): void {
    if (this.isUtilisateur()) {
      this.router.navigate(['/app/formations']);
    } else {
      this.router.navigate(['/app/dashboard']);
    }
  }
}

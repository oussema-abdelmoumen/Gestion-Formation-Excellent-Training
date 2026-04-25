import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private api = 'http://localhost:8080/api/utilisateurs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.api);
  }

  getById(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.api}/${id}`);
  }

  create(item: Utilisateur): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(this.api, item);
  }

  update(id: number, item: Utilisateur): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.api}/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}

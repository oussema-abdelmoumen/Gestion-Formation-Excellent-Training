import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profil } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ProfilService {
  private api = 'http://localhost:8080/api/profils';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Profil[]> {
    return this.http.get<Profil[]>(this.api);
  }

  getById(id: number): Observable<Profil> {
    return this.http.get<Profil>(`${this.api}/${id}`);
  }

  create(item: Profil): Observable<Profil> {
    return this.http.post<Profil>(this.api, item);
  }

  update(id: number, item: Profil): Observable<Profil> {
    return this.http.put<Profil>(`${this.api}/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}

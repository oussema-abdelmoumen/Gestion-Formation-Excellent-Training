import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Domaine } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class DomaineService {
  private api = 'http://localhost:8080/api/domaines';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Domaine[]> {
    return this.http.get<Domaine[]>(this.api);
  }

  getById(id: number): Observable<Domaine> {
    return this.http.get<Domaine>(`${this.api}/${id}`);
  }

  create(item: Domaine): Observable<Domaine> {
    return this.http.post<Domaine>(this.api, item);
  }

  update(id: number, item: Domaine): Observable<Domaine> {
    return this.http.put<Domaine>(`${this.api}/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}

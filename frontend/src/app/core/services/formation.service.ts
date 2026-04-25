import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Formation } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class FormationService {
  private api = 'http://localhost:8080/api/formations';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Formation[]> { return this.http.get<Formation[]>(this.api); }
  getById(id: number): Observable<Formation> { return this.http.get<Formation>(`${this.api}/${id}`); }
  create(f: Formation): Observable<Formation> { return this.http.post<Formation>(this.api, f); }
  update(id: number, f: Formation): Observable<Formation> { return this.http.put<Formation>(`${this.api}/${id}`, f); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/${id}`); }

  getStatsByDomaine(): Observable<{[k:string]:number}> { return this.http.get<any>(`${this.api}/stats/domaine`); }
  getStatsByAnnee(): Observable<{[k:string]:number}> { return this.http.get<any>(`${this.api}/stats/annee`); }
  getStatsBudget(): Observable<{[k:string]:number}> { return this.http.get<any>(`${this.api}/stats/budget`); }

  exportExcel(): Observable<Blob> {
    return this.http.get(`${this.api}/export/excel`, { responseType: 'blob' });
  }

  getByUserId(userId: number): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.api}/by-user/${userId}`);
  }

}
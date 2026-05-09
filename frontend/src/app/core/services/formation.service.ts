import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  // ─── Stats endpoints (with optional year filter) ───

  getStatsByDomaine(annee?: number): Observable<{[k:string]:number}> {
    let params = new HttpParams();
    if (annee) params = params.set('annee', annee.toString());
    return this.http.get<any>(`${this.api}/stats/domaine`, { params });
  }

  getStatsByAnnee(): Observable<{[k:string]:number}> {
    return this.http.get<any>(`${this.api}/stats/annee`);
  }

  getStatsBudget(annee?: number): Observable<{[k:string]:number}> {
    let params = new HttpParams();
    if (annee) params = params.set('annee', annee.toString());
    return this.http.get<any>(`${this.api}/stats/budget`, { params });
  }

  getStatsByFormateur(annee?: number): Observable<{[k:string]:number}> {
    let params = new HttpParams();
    if (annee) params = params.set('annee', annee.toString());
    return this.http.get<any>(`${this.api}/stats/formateur`, { params });
  }

  getStatsBudgetByAnnee(): Observable<{[k:string]:number}> {
    return this.http.get<any>(`${this.api}/stats/budget-annee`);
  }

  getStatsParticipantsByAnnee(): Observable<{[k:string]:number}> {
    return this.http.get<any>(`${this.api}/stats/participants-annee`);
  }

  getStatsAvgParticipants(): Observable<{[k:string]:number}> {
    return this.http.get<any>(`${this.api}/stats/avg-participants`);
  }

  getStatsByDate(annee?: number): Observable<{[k:string]:number}> {
    let params = new HttpParams();
    if (annee) params = params.set('annee', annee.toString());
    return this.http.get<any>(`${this.api}/stats/by-date`, { params });
  }

  getStatsAvgDuree(): Observable<{[k:string]:number}> {
    return this.http.get<any>(`${this.api}/stats/avg-duree`);
  }

  getStatsByStructure(): Observable<{[k:string]:number}> {
    return this.http.get<any>(`${this.api}/stats/structure`);
  }

  exportExcel(): Observable<Blob> {
    return this.http.get(`${this.api}/export/excel`, { responseType: 'blob' });
  }

  getByUserId(userId: number): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.api}/by-user/${userId}`);
  }

  importExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.api}/import`, formData);
  }

}
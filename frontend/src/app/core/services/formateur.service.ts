import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Formateur } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class FormateurService {
  private api = 'http://localhost:8080/api/formateurs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Formateur[]> {
    return this.http.get<Formateur[]>(this.api);
  }

  getById(id: number): Observable<Formateur> {
    return this.http.get<Formateur>(`${this.api}/${id}`);
  }

  create(item: Formateur): Observable<Formateur> {
    return this.http.post<Formateur>(this.api, item);
  }

  update(id: number, item: Formateur): Observable<Formateur> {
    return this.http.put<Formateur>(`${this.api}/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  deleteBulk(ids: number[]): Observable<any> {
    return this.http.post<any>(`${this.api}/delete-bulk`, ids);
  }

  importExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.api}/import`, formData);
  }
}

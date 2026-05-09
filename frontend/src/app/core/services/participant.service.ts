import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Participant } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ParticipantService {
  private api = 'http://localhost:8080/api/participants';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Participant[]> {
    return this.http.get<Participant[]>(this.api);
  }

  getById(id: number): Observable<Participant> {
    return this.http.get<Participant>(`${this.api}/${id}`);
  }

  create(item: Participant): Observable<Participant> {
    return this.http.post<Participant>(this.api, item);
  }

  update(id: number, item: Participant): Observable<Participant> {
    return this.http.put<Participant>(`${this.api}/${id}`, item);
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

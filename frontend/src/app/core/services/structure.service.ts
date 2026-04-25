import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Structure } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class StructureService {
  private api = 'http://localhost:8080/api/structures';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Structure[]> {
    return this.http.get<Structure[]>(this.api);
  }

  getById(id: number): Observable<Structure> {
    return this.http.get<Structure>(`${this.api}/${id}`);
  }

  create(item: Structure): Observable<Structure> {
    return this.http.post<Structure>(this.api, item);
  }

  update(id: number, item: Structure): Observable<Structure> {
    return this.http.put<Structure>(`${this.api}/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}

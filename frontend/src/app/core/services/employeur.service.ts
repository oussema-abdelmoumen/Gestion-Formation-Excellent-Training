import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employeur } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class EmployeurService {
  private api = 'http://localhost:8080/api/employeurs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Employeur[]> {
    return this.http.get<Employeur[]>(this.api);
  }

  getById(id: number): Observable<Employeur> {
    return this.http.get<Employeur>(`${this.api}/${id}`);
  }

  create(item: Employeur): Observable<Employeur> {
    return this.http.post<Employeur>(this.api, item);
  }

  update(id: number, item: Employeur): Observable<Employeur> {
    return this.http.put<Employeur>(`${this.api}/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}

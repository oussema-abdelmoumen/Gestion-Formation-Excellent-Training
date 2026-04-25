import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private api = 'http://localhost:8080/api/roles';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.api);
  }

  getById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.api}/${id}`);
  }

  create(item: Role): Observable<Role> {
    return this.http.post<Role>(this.api, item);
  }

  update(id: number, item: Role): Observable<Role> {
    return this.http.put<Role>(`${this.api}/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}

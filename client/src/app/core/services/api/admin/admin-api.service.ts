import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../../models/user/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private adminApi = environment.adminApiUrl;

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.adminApi);
  }

  addUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.adminApi, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.adminApi}/${id}`, user);
  }

  toggleBlockUser(id: string): Observable<any> {
    return this.http.patch(`${this.adminApi}/${id}/block`, {});
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.adminApi}/${id}`);
  }

}
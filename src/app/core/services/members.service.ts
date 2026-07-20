import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Member } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class MembersService {
  private readonly http = inject(HttpClient);

  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(`${API_URL}/members`);
  }
}

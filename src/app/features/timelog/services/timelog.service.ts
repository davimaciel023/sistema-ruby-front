import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import { MemberHoursReport, TimeLog, TimeLogCategory } from '../../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class TimelogService {
  private readonly http = inject(HttpClient);

  getOpenSession(): Observable<TimeLog | null> {
    return this.http.get<TimeLog | null>(`${API_URL}/timelogs/open`);
  }

  checkIn(category: TimeLogCategory, description: string): Observable<TimeLog> {
    return this.http.post<TimeLog>(`${API_URL}/timelogs/check-in`, { category, description });
  }

  checkOut(): Observable<TimeLog> {
    return this.http.post<TimeLog>(`${API_URL}/timelogs/check-out`, null);
  }

  getLogs(): Observable<TimeLog[]> {
    return this.http.get<TimeLog[]>(`${API_URL}/timelogs`);
  }

  getReport(): Observable<MemberHoursReport[]> {
    return this.http.get<MemberHoursReport[]>(`${API_URL}/timelogs/report`);
  }

  deleteLog(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/timelogs/${id}`);
  }
}

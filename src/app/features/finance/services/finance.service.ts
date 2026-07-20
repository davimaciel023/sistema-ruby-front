import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import { EntryType, FinanceEntry, FinanceSummary } from '../../../core/models/api.models';

export interface EntryPayload {
  type: EntryType;
  category: string;
  description: string;
  amount: number;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly http = inject(HttpClient);

  getEntries(): Observable<FinanceEntry[]> {
    return this.http.get<FinanceEntry[]>(`${API_URL}/finance/entries`);
  }

  getSummary(): Observable<FinanceSummary> {
    return this.http.get<FinanceSummary>(`${API_URL}/finance/summary`);
  }

  createEntry(payload: EntryPayload): Observable<FinanceEntry> {
    return this.http.post<FinanceEntry>(`${API_URL}/finance/entries`, payload);
  }

  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/finance/entries/${id}`);
  }
}

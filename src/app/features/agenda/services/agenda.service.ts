import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import {
  BandEvent,
  EventCostInput,
  EventType,
  PaymentStatus,
  PayoutInput,
  Recurrence,
} from '../../../core/models/api.models';

export interface EventPayload {
  type: EventType;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string;
  recurrence: Recurrence;
  notes: string;
  contractor: string;
  contractor_contact: string;
  fee: number | null;
  payouts?: PayoutInput[];
  costs?: EventCostInput[];
}

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);

  getEvents(): Observable<BandEvent[]> {
    return this.http.get<BandEvent[]>(`${API_URL}/events`);
  }

  createEvent(payload: EventPayload): Observable<BandEvent> {
    return this.http.post<BandEvent>(`${API_URL}/events`, payload);
  }

  updateEvent(
    id: number,
    payload: Partial<EventPayload> & { payment_status?: PaymentStatus },
  ): Observable<BandEvent> {
    return this.http.patch<BandEvent>(`${API_URL}/events/${id}`, payload);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/events/${id}`);
  }

  togglePayout(eventId: number, payoutId: number, received: boolean): Observable<BandEvent> {
    const params = new HttpParams().set('received', received);
    return this.http.patch<BandEvent>(
      `${API_URL}/events/${eventId}/payouts/${payoutId}`,
      null,
      { params },
    );
  }

  updatePayouts(eventId: number, payouts: PayoutInput[]): Observable<BandEvent> {
    return this.http.patch<BandEvent>(`${API_URL}/events/${eventId}`, { payouts });
  }

  addCost(eventId: number, cost: EventCostInput): Observable<BandEvent> {
    return this.http.post<BandEvent>(`${API_URL}/events/${eventId}/costs`, cost);
  }

  toggleCost(eventId: number, costId: number, paid: boolean): Observable<BandEvent> {
    const params = new HttpParams().set('paid', paid);
    return this.http.patch<BandEvent>(
      `${API_URL}/events/${eventId}/costs/${costId}`,
      null,
      { params },
    );
  }

  deleteCost(eventId: number, costId: number): Observable<BandEvent> {
    return this.http.delete<BandEvent>(`${API_URL}/events/${eventId}/costs/${costId}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import { Repertoire, Song } from '../../../core/models/api.models';

export interface SongPayload {
  title: string;
  original_artist: string;
  key: string;
  duration_seconds: number;
  bpm: number | null;
  lyrics: string;
  chords: string;
  notes: string;
}

export interface RepertoireItemPayload {
  song_id: number;
  performed_key: string | null;
}

export interface RepertoirePayload {
  name: string;
  date: string | null;
  gap_seconds: number;
  notes: string;
  items: RepertoireItemPayload[];
}

@Injectable({ providedIn: 'root' })
export class RepertoireService {
  private readonly http = inject(HttpClient);

  getSongs(): Observable<Song[]> {
    return this.http.get<Song[]>(`${API_URL}/repertoire/songs`);
  }

  createSong(payload: SongPayload): Observable<Song> {
    return this.http.post<Song>(`${API_URL}/repertoire/songs`, payload);
  }

  updateSong(id: number, payload: Partial<SongPayload>): Observable<Song> {
    return this.http.patch<Song>(`${API_URL}/repertoire/songs/${id}`, payload);
  }

  deleteSong(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/repertoire/songs/${id}`);
  }

  getRepertoires(): Observable<Repertoire[]> {
    return this.http.get<Repertoire[]>(`${API_URL}/repertoire`);
  }

  createRepertoire(payload: RepertoirePayload): Observable<Repertoire> {
    return this.http.post<Repertoire>(`${API_URL}/repertoire`, payload);
  }

  updateRepertoire(id: number, payload: Partial<RepertoirePayload>): Observable<Repertoire> {
    return this.http.patch<Repertoire>(`${API_URL}/repertoire/${id}`, payload);
  }

  deleteRepertoire(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/repertoire/${id}`);
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${API_URL}/repertoire/${id}/pdf`, { responseType: 'blob' });
  }

  downloadCombinedPdf(ids: number[]): Observable<Blob> {
    return this.http.get(`${API_URL}/repertoire/pdf-combined`, {
      params: { ids: ids.join(',') },
      responseType: 'blob',
    });
  }
}

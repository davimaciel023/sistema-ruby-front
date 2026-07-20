import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import { MaterialStatus, MaterialType, StudyMaterial } from '../../../core/models/api.models';

export interface MaterialPayload {
  title: string;
  type: MaterialType;
  url: string;
  notes: string;
  owner_id: number | null;
  status: MaterialStatus;
}

@Injectable({ providedIn: 'root' })
export class StudyService {
  private readonly http = inject(HttpClient);

  getMaterials(): Observable<StudyMaterial[]> {
    return this.http.get<StudyMaterial[]>(`${API_URL}/study/materials`);
  }

  createMaterial(payload: MaterialPayload): Observable<StudyMaterial> {
    return this.http.post<StudyMaterial>(`${API_URL}/study/materials`, payload);
  }

  updateMaterial(id: number, payload: Partial<MaterialPayload>): Observable<StudyMaterial> {
    return this.http.patch<StudyMaterial>(`${API_URL}/study/materials/${id}`, payload);
  }

  deleteMaterial(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/study/materials/${id}`);
  }
}

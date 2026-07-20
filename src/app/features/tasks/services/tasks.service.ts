import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import { BandTask, TaskComment, TaskPriority, TaskStatus } from '../../../core/models/api.models';

export interface TaskPayload {
  title: string;
  description: string;
  assignee_id: number;
  due_at: string;
  priority: TaskPriority;
  category: string;
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);

  getTasks(assigneeId?: number): Observable<BandTask[]> {
    let params = new HttpParams();
    if (assigneeId !== undefined) {
      params = params.set('assignee_id', assigneeId);
    }
    return this.http.get<BandTask[]>(`${API_URL}/tasks`, { params });
  }

  createTask(payload: TaskPayload): Observable<BandTask> {
    return this.http.post<BandTask>(`${API_URL}/tasks`, payload);
  }

  updateTask(id: number, payload: Partial<TaskPayload> & { status?: TaskStatus }): Observable<BandTask> {
    return this.http.patch<BandTask>(`${API_URL}/tasks/${id}`, payload);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/tasks/${id}`);
  }

  addComment(taskId: number, text: string): Observable<TaskComment> {
    return this.http.post<TaskComment>(`${API_URL}/tasks/${taskId}/comments`, { text });
  }
}

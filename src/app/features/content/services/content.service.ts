import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import {
  AiIdea,
  ContentPost,
  Platform,
  PostStatus,
  VideoIdea,
  VideoIdeaStatus,
} from '../../../core/models/api.models';

export interface PostPayload {
  platform: Platform;
  planned_date: string;
  theme: string;
  responsible_id: number;
  status: PostStatus;
  link: string;
}

export interface VideoIdeaPayload {
  title: string;
  description: string;
  responsible_id: number | null;
  status: VideoIdeaStatus;
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);

  getPosts(): Observable<ContentPost[]> {
    return this.http.get<ContentPost[]>(`${API_URL}/content/posts`);
  }

  createPost(payload: PostPayload): Observable<ContentPost> {
    return this.http.post<ContentPost>(`${API_URL}/content/posts`, payload);
  }

  updatePost(id: number, payload: Partial<PostPayload>): Observable<ContentPost> {
    return this.http.patch<ContentPost>(`${API_URL}/content/posts/${id}`, payload);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/content/posts/${id}`);
  }

  getIdeas(): Observable<VideoIdea[]> {
    return this.http.get<VideoIdea[]>(`${API_URL}/content/video-ideas`);
  }

  createIdea(payload: VideoIdeaPayload): Observable<VideoIdea> {
    return this.http.post<VideoIdea>(`${API_URL}/content/video-ideas`, payload);
  }

  updateIdea(id: number, payload: Partial<VideoIdeaPayload>): Observable<VideoIdea> {
    return this.http.patch<VideoIdea>(`${API_URL}/content/video-ideas/${id}`, payload);
  }

  deleteIdea(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/content/video-ideas/${id}`);
  }

  generateAiIdeas(prompt: string): Observable<{ ideas: AiIdea[] }> {
    return this.http.post<{ ideas: AiIdea[] }>(`${API_URL}/content/ai-ideas`, { prompt });
  }
}

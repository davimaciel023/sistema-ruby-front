import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Member } from '../models/api.models';

interface TokenResponse {
  access_token: string;
  token_type: string;
}

const TOKEN_KEY = 'forro_ruby_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly currentMember = signal<Member | null>(null);
  readonly isAuthenticated = computed(() => this.token() !== null);

  login(email: string, password: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${API_URL}/auth/login-json`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          this.token.set(res.access_token);
        }),
      );
  }

  loadCurrentMember(): Observable<Member> {
    return this.http
      .get<Member>(`${API_URL}/auth/me`)
      .pipe(tap((member) => this.currentMember.set(member)));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${API_URL}/auth/change-password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.currentMember.set(null);
    this.router.navigate(['/login']);
  }
}

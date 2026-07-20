import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Injectable()
export class LoginViewModel {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  submit(): void {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Informe e-mail e senha');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.auth.login(this.email(), this.password()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.detail ?? 'Não foi possível entrar. Verifique a conexão.',
        );
      },
    });
  }
}

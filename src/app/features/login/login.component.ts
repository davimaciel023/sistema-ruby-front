import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginViewModel } from './login.viewmodel';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  providers: [LoginViewModel],
})
export class LoginComponent {
  protected readonly vm = inject(LoginViewModel);
}

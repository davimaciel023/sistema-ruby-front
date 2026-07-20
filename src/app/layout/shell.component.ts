import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { IconComponent } from '../shared/icons/icon.component';
import { IconName } from '../shared/icons/icons';

interface NavItem {
  label: string;
  route: string;
  icon: IconName;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './shell.component.html',
})
export class ShellComponent implements OnInit {
  protected readonly auth = inject(AuthService);

  protected readonly sidebarOpen = signal(false);

  protected readonly navItems: NavItem[] = [
    { label: 'Início', route: '/dashboard', icon: 'home' },
    { label: 'Tarefas', route: '/tarefas', icon: 'tasks' },
    { label: 'Agenda', route: '/agenda', icon: 'calendar' },
    { label: 'Financeiro', route: '/financeiro', icon: 'money' },
    { label: 'Ponto', route: '/ponto', icon: 'clock' },
    { label: 'Estudo', route: '/estudo', icon: 'book' },
    { label: 'Conteúdo', route: '/conteudo', icon: 'megaphone' },
    { label: 'Repertório', route: '/repertorio', icon: 'music' },
  ];

  ngOnInit(): void {
    if (!this.auth.currentMember()) {
      this.auth.loadCurrentMember().subscribe();
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}

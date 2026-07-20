import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'tarefas',
        loadComponent: () =>
          import('./features/tasks/tasks.component').then((m) => m.TasksComponent),
      },
      {
        path: 'agenda',
        loadComponent: () =>
          import('./features/agenda/agenda.component').then((m) => m.AgendaComponent),
      },
      {
        path: 'financeiro',
        loadComponent: () =>
          import('./features/finance/finance.component').then((m) => m.FinanceComponent),
      },
      {
        path: 'ponto',
        loadComponent: () =>
          import('./features/timelog/timelog.component').then((m) => m.TimelogComponent),
      },
      {
        path: 'estudo',
        loadComponent: () =>
          import('./features/study/study.component').then((m) => m.StudyComponent),
      },
      {
        path: 'conteudo',
        loadComponent: () =>
          import('./features/content/content.component').then((m) => m.ContentComponent),
      },
      {
        path: 'repertorio',
        loadComponent: () =>
          import('./features/repertoire/repertoire.component').then((m) => m.RepertoireComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

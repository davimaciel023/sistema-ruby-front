import { Injectable, computed, inject, signal } from '@angular/core';
import { Dashboard, EventType } from '../../core/models/api.models';
import { DashboardService } from './services/dashboard.service';

const EVENT_LABELS: Record<EventType, string> = {
  show: 'Show',
  rehearsal: 'Ensaio',
  reminder: 'Lembrete',
  fixed: 'Atividade fixa',
};

@Injectable()
export class DashboardViewModel {
  private readonly service = inject(DashboardService);

  readonly data = signal<Dashboard | null>(null);
  readonly isLoading = signal(true);

  readonly overdueAlerts = computed(
    () => this.data()?.alerts.filter((a) => a.level === 'overdue') ?? [],
  );
  readonly dueSoonAlerts = computed(
    () => this.data()?.alerts.filter((a) => a.level !== 'overdue') ?? [],
  );

  load(): void {
    this.isLoading.set(true);
    this.service.getDashboard().subscribe({
      next: (data) => {
        this.data.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  eventLabel(type: EventType): string {
    return EVENT_LABELS[type];
  }
}

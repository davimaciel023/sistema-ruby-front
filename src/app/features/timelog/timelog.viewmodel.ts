import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { MemberHoursReport, TimeLog, TimeLogCategory } from '../../core/models/api.models';
import { TimelogService } from './services/timelog.service';

@Injectable()
export class TimelogViewModel {
  private readonly service = inject(TimelogService);
  private readonly auth = inject(AuthService);

  readonly openSession = signal<TimeLog | null>(null);
  readonly logs = signal<TimeLog[]>([]);
  readonly report = signal<MemberHoursReport[]>([]);
  readonly isLoading = signal(true);

  readonly checkInCategory = signal<TimeLogCategory>('work');
  readonly checkInDescription = signal('');

  readonly currentMemberId = computed(() => this.auth.currentMember()?.id ?? null);

  readonly myTodayMinutes = computed(() => {
    const me = this.currentMemberId();
    const today = new Date().toISOString().slice(0, 10);
    return this.logs()
      .filter((log) => log.member.id === me && log.date === today)
      .reduce((total, log) => total + (log.duration_minutes ?? 0), 0);
  });

  readonly goalMinutes = 90;

  readonly goalProgress = computed(() =>
    Math.min(100, Math.round((this.myTodayMinutes() / this.goalMinutes) * 100)),
  );

  load(): void {
    this.isLoading.set(true);
    this.service.getOpenSession().subscribe((session) => this.openSession.set(session));
    this.service.getLogs().subscribe({
      next: (logs) => {
        this.logs.set(logs);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
    this.service.getReport().subscribe((report) => this.report.set(report));
  }

  checkIn(): void {
    this.service
      .checkIn(this.checkInCategory(), this.checkInDescription())
      .subscribe(() => {
        this.checkInDescription.set('');
        this.load();
      });
  }

  checkOut(): void {
    this.service.checkOut().subscribe(() => this.load());
  }

  deleteLog(log: TimeLog): void {
    this.service.deleteLog(log.id).subscribe(() => this.load());
  }

  formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return hours > 0 ? `${hours}h ${rest.toString().padStart(2, '0')}min` : `${rest}min`;
  }
}

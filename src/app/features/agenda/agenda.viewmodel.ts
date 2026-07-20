import { Injectable, computed, inject, signal } from '@angular/core';
import {
  BandEvent,
  EventCostInput,
  EventType,
  Member,
  Recurrence,
} from '../../core/models/api.models';
import { MembersService } from '../../core/services/members.service';
import { AgendaService } from './services/agenda.service';

const EVENT_LABELS: Record<EventType, string> = {
  show: 'Show',
  rehearsal: 'Ensaio',
  reminder: 'Lembrete',
  fixed: 'Atividade fixa',
};

const RECURRENCE_LABELS: Record<Recurrence, string> = {
  none: 'Sem repetição',
  weekly: 'Toda semana',
  biweekly: 'A cada 15 dias',
  monthly: 'Todo mês',
};

interface PayoutFormRow {
  memberId: number;
  name: string;
  color: string;
  amount: number | null;
}

@Injectable()
export class AgendaViewModel {
  private readonly service = inject(AgendaService);
  private readonly membersService = inject(MembersService);

  readonly events = signal<BandEvent[]>([]);
  readonly members = signal<Member[]>([]);
  readonly isLoading = signal(true);
  readonly typeFilter = signal<EventType | null>(null);
  readonly showForm = signal(false);
  readonly expandedEventId = signal<number | null>(null);

  readonly formType = signal<EventType>('show');
  readonly formTitle = signal('');
  readonly formDate = signal('');
  readonly formStartTime = signal('');
  readonly formEndTime = signal('');
  readonly formLocation = signal('');
  readonly formRecurrence = signal<Recurrence>('none');
  readonly formNotes = signal('');
  readonly formContractor = signal('');
  readonly formContact = signal('');
  readonly formFee = signal<number | null>(null);
  readonly formPayouts = signal<PayoutFormRow[]>([]);
  readonly formCosts = signal<EventCostInput[]>([]);
  readonly formCostDescription = signal('');
  readonly formCostAmount = signal<number | null>(null);

  readonly newCostDescription = signal('');
  readonly newCostAmount = signal<number | null>(null);

  readonly formPayoutsTotal = computed(() =>
    this.formPayouts().reduce((sum, row) => sum + (row.amount ?? 0), 0),
  );

  readonly formCostsTotal = computed(() =>
    this.formCosts().reduce((sum, cost) => sum + cost.amount, 0),
  );

  readonly formReserve = computed(() => {
    const fee = this.formFee();
    if (fee === null) {
      return null;
    }
    return fee - this.formPayoutsTotal() - this.formCostsTotal();
  });

  readonly upcomingEvents = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    return this.filtered().filter((e) => e.date >= today);
  });

  readonly pastEvents = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    return this.filtered()
      .filter((e) => e.date < today)
      .reverse();
  });

  private readonly filtered = computed(() => {
    const filter = this.typeFilter();
    const events = this.events();
    return filter === null ? events : events.filter((e) => e.type === filter);
  });

  load(): void {
    this.isLoading.set(true);
    this.service.getEvents().subscribe({
      next: (events) => {
        this.events.set(events);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
    if (this.members().length === 0) {
      this.membersService.getMembers().subscribe((members) => {
        this.members.set(members);
        if (this.showForm()) {
          this.resetFormPayouts();
        }
      });
    }
  }

  setFilter(type: EventType | null): void {
    this.typeFilter.set(type);
  }

  openForm(): void {
    this.formType.set('show');
    this.formTitle.set('');
    this.formDate.set('');
    this.formStartTime.set('');
    this.formEndTime.set('');
    this.formLocation.set('');
    this.formRecurrence.set('none');
    this.formNotes.set('');
    this.formContractor.set('');
    this.formContact.set('');
    this.formFee.set(null);
    this.formCosts.set([]);
    this.formCostDescription.set('');
    this.formCostAmount.set(null);
    this.resetFormPayouts();
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  setPayoutAmount(memberId: number, amount: number | null): void {
    this.formPayouts.update((rows) =>
      rows.map((row) => (row.memberId === memberId ? { ...row, amount } : row)),
    );
  }

  splitFeeEqually(): void {
    const fee = this.formFee();
    const rows = this.formPayouts();
    if (fee === null || rows.length === 0) {
      return;
    }
    const share = Math.round((fee / rows.length) * 100) / 100;
    this.formPayouts.set(rows.map((row) => ({ ...row, amount: share })));
  }

  addFormCost(): void {
    const description = this.formCostDescription().trim();
    const amount = this.formCostAmount();
    if (!description || amount === null || amount <= 0) {
      return;
    }
    this.formCosts.update((costs) => [...costs, { description, amount }]);
    this.formCostDescription.set('');
    this.formCostAmount.set(null);
  }

  removeFormCost(index: number): void {
    this.formCosts.update((costs) => costs.filter((_, i) => i !== index));
  }

  submitForm(): void {
    if (!this.formTitle() || !this.formDate()) {
      return;
    }
    const isShow = this.formType() === 'show';
    const payouts = this.formPayouts()
      .filter((row) => row.amount !== null)
      .map((row) => ({ member_id: row.memberId, amount: row.amount ?? 0 }));
    this.service
      .createEvent({
        type: this.formType(),
        title: this.formTitle(),
        date: this.formDate(),
        start_time: this.formStartTime() || null,
        end_time: this.formEndTime() || null,
        location: this.formLocation(),
        recurrence: this.formRecurrence(),
        notes: this.formNotes(),
        contractor: this.formContractor(),
        contractor_contact: this.formContact(),
        fee: this.formFee(),
        payouts: isShow && payouts.length > 0 ? payouts : undefined,
        costs: isShow ? this.formCosts() : undefined,
      })
      .subscribe(() => {
        this.showForm.set(false);
        this.load();
      });
  }

  deleteEvent(event: BandEvent): void {
    this.service.deleteEvent(event.id).subscribe(() => this.load());
  }

  markFeeReceived(event: BandEvent): void {
    this.service.updateEvent(event.id, { payment_status: 'received' }).subscribe(() => this.load());
  }

  togglePayout(event: BandEvent, payoutId: number, received: boolean): void {
    this.service.togglePayout(event.id, payoutId, received).subscribe(() => this.load());
  }

  updatePayoutAmount(event: BandEvent, payoutId: number, value: string): void {
    const amount = Number(value);
    if (Number.isNaN(amount) || amount < 0) {
      return;
    }
    const payouts = event.payouts.map((p) => ({
      member_id: p.member.id,
      amount: p.id === payoutId ? amount : p.amount,
    }));
    this.service.updatePayouts(event.id, payouts).subscribe(() => this.load());
  }

  addCost(event: BandEvent): void {
    const description = this.newCostDescription().trim();
    const amount = this.newCostAmount();
    if (!description || amount === null || amount <= 0) {
      return;
    }
    this.service.addCost(event.id, { description, amount }).subscribe(() => {
      this.newCostDescription.set('');
      this.newCostAmount.set(null);
      this.load();
    });
  }

  toggleCost(event: BandEvent, costId: number, paid: boolean): void {
    this.service.toggleCost(event.id, costId, paid).subscribe(() => this.load());
  }

  deleteCost(event: BandEvent, costId: number): void {
    this.service.deleteCost(event.id, costId).subscribe(() => this.load());
  }

  eventReserve(event: BandEvent): number | null {
    if (event.fee === null) {
      return null;
    }
    const payouts = event.payouts.reduce((sum, p) => sum + p.amount, 0);
    const costs = event.costs.reduce((sum, c) => sum + c.amount, 0);
    return event.fee - payouts - costs;
  }

  toggleExpand(eventId: number): void {
    this.expandedEventId.update((current) => (current === eventId ? null : eventId));
    this.newCostDescription.set('');
    this.newCostAmount.set(null);
  }

  eventLabel(type: EventType): string {
    return EVENT_LABELS[type];
  }

  recurrenceLabel(recurrence: Recurrence): string {
    return RECURRENCE_LABELS[recurrence];
  }

  private resetFormPayouts(): void {
    this.formPayouts.set(
      this.members().map((member) => ({
        memberId: member.id,
        name: member.name,
        color: member.avatar_color,
        amount: null,
      })),
    );
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { EntryType, FinanceEntry, FinanceSummary } from '../../core/models/api.models';
import { FinanceService } from './services/finance.service';

@Injectable()
export class FinanceViewModel {
  private readonly service = inject(FinanceService);

  readonly entries = signal<FinanceEntry[]>([]);
  readonly summary = signal<FinanceSummary | null>(null);
  readonly isLoading = signal(true);
  readonly showForm = signal(false);

  readonly formType = signal<EntryType>('expense');
  readonly formCategory = signal('');
  readonly formDescription = signal('');
  readonly formAmount = signal<number | null>(null);
  readonly formDate = signal('');

  load(): void {
    this.isLoading.set(true);
    this.service.getEntries().subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
    this.service.getSummary().subscribe((summary) => this.summary.set(summary));
  }

  openForm(): void {
    this.formType.set('expense');
    this.formCategory.set('');
    this.formDescription.set('');
    this.formAmount.set(null);
    this.formDate.set(new Date().toISOString().slice(0, 10));
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  submitForm(): void {
    const amount = this.formAmount();
    if (!this.formCategory() || amount === null || amount <= 0 || !this.formDate()) {
      return;
    }
    this.service
      .createEntry({
        type: this.formType(),
        category: this.formCategory(),
        description: this.formDescription(),
        amount,
        date: this.formDate(),
      })
      .subscribe(() => {
        this.showForm.set(false);
        this.load();
      });
  }

  deleteEntry(entry: FinanceEntry): void {
    this.service.deleteEntry(entry.id).subscribe(() => this.load());
  }
}

import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import {
  MaterialStatus,
  MaterialType,
  StudyMaterial,
} from '../../core/models/api.models';
import { StudyService } from './services/study.service';

const TYPE_LABELS: Record<MaterialType, string> = {
  link: 'Link',
  pdf: 'PDF',
  video: 'Vídeo',
  chord_chart: 'Cifra',
};

const STATUS_LABELS: Record<MaterialStatus, string> = {
  to_study: 'A estudar',
  studying: 'Estudando',
  mastered: 'Dominado',
};

@Injectable()
export class StudyViewModel {
  private readonly service = inject(StudyService);
  private readonly auth = inject(AuthService);

  readonly materials = signal<StudyMaterial[]>([]);
  readonly isLoading = signal(true);
  readonly statusFilter = signal<MaterialStatus | null>(null);
  readonly showForm = signal(false);

  readonly formTitle = signal('');
  readonly formType = signal<MaterialType>('link');
  readonly formUrl = signal('');
  readonly formNotes = signal('');
  readonly formOnlyMine = signal(false);

  readonly filteredMaterials = computed(() => {
    const filter = this.statusFilter();
    const materials = this.materials();
    return filter === null ? materials : materials.filter((m) => m.status === filter);
  });

  load(): void {
    this.isLoading.set(true);
    this.service.getMaterials().subscribe({
      next: (materials) => {
        this.materials.set(materials);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setFilter(status: MaterialStatus | null): void {
    this.statusFilter.set(status);
  }

  openForm(): void {
    this.formTitle.set('');
    this.formType.set('link');
    this.formUrl.set('');
    this.formNotes.set('');
    this.formOnlyMine.set(false);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  submitForm(): void {
    if (!this.formTitle()) {
      return;
    }
    this.service
      .createMaterial({
        title: this.formTitle(),
        type: this.formType(),
        url: this.formUrl(),
        notes: this.formNotes(),
        owner_id: this.formOnlyMine() ? (this.auth.currentMember()?.id ?? null) : null,
        status: 'to_study',
      })
      .subscribe(() => {
        this.showForm.set(false);
        this.load();
      });
  }

  cycleStatus(material: StudyMaterial): void {
    const order: MaterialStatus[] = ['to_study', 'studying', 'mastered'];
    const next = order[(order.indexOf(material.status) + 1) % order.length];
    this.service.updateMaterial(material.id, { status: next }).subscribe(() => this.load());
  }

  deleteMaterial(material: StudyMaterial): void {
    this.service.deleteMaterial(material.id).subscribe(() => this.load());
  }

  typeLabel(type: MaterialType): string {
    return TYPE_LABELS[type];
  }

  statusLabel(status: MaterialStatus): string {
    return STATUS_LABELS[status];
  }
}

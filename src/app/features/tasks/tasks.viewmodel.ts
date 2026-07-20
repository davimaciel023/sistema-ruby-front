import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { MembersService } from '../../core/services/members.service';
import { BandTask, Member, TaskPriority, TaskStatus } from '../../core/models/api.models';
import { TasksService } from './services/tasks.service';

@Injectable()
export class TasksViewModel {
  private readonly service = inject(TasksService);
  private readonly membersService = inject(MembersService);
  private readonly auth = inject(AuthService);

  readonly tasks = signal<BandTask[]>([]);
  readonly members = signal<Member[]>([]);
  readonly isLoading = signal(true);
  readonly selectedMemberId = signal<number | null>(null);
  readonly showForm = signal(false);
  readonly expandedTaskId = signal<number | null>(null);
  readonly commentDraft = signal('');

  readonly formTitle = signal('');
  readonly formDescription = signal('');
  readonly formAssigneeId = signal<number | null>(null);
  readonly formDueAt = signal('');
  readonly formPriority = signal<TaskPriority>('medium');

  readonly currentMemberId = computed(() => this.auth.currentMember()?.id ?? null);

  readonly filteredTasks = computed(() => {
    const memberId = this.selectedMemberId();
    const tasks = this.tasks();
    return memberId === null ? tasks : tasks.filter((t) => t.assignee.id === memberId);
  });

  readonly pendingTasks = computed(() =>
    this.filteredTasks().filter((t) => t.status !== 'done'),
  );
  readonly doneTasks = computed(() => this.filteredTasks().filter((t) => t.status === 'done'));

  load(): void {
    this.isLoading.set(true);
    this.service.getTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
    this.membersService.getMembers().subscribe((members) => this.members.set(members));
  }

  selectMember(memberId: number | null): void {
    this.selectedMemberId.set(memberId);
  }

  openForm(): void {
    this.formTitle.set('');
    this.formDescription.set('');
    this.formAssigneeId.set(this.currentMemberId());
    this.formDueAt.set('');
    this.formPriority.set('medium');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  submitForm(): void {
    const assigneeId = this.formAssigneeId();
    if (!this.formTitle() || assigneeId === null || !this.formDueAt()) {
      return;
    }
    this.service
      .createTask({
        title: this.formTitle(),
        description: this.formDescription(),
        assignee_id: assigneeId,
        due_at: new Date(this.formDueAt()).toISOString(),
        priority: this.formPriority(),
        category: 'geral',
      })
      .subscribe(() => {
        this.showForm.set(false);
        this.load();
      });
  }

  setStatus(task: BandTask, status: TaskStatus): void {
    this.service.updateTask(task.id, { status }).subscribe(() => this.load());
  }

  deleteTask(task: BandTask): void {
    this.service.deleteTask(task.id).subscribe(() => this.load());
  }

  toggleExpand(taskId: number): void {
    this.commentDraft.set('');
    this.expandedTaskId.update((current) => (current === taskId ? null : taskId));
  }

  submitComment(task: BandTask): void {
    const text = this.commentDraft().trim();
    if (!text) {
      return;
    }
    this.service.addComment(task.id, text).subscribe(() => {
      this.commentDraft.set('');
      this.load();
    });
  }

  canEdit(task: BandTask): boolean {
    const me = this.currentMemberId();
    return me !== null && (task.assignee.id === me || task.creator.id === me);
  }

  isOverdue(task: BandTask): boolean {
    return task.status !== 'done' && new Date(task.due_at).getTime() < Date.now();
  }
}

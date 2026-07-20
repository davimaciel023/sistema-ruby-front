import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { MembersService } from '../../core/services/members.service';
import {
  AiIdea,
  ContentPost,
  Member,
  Platform,
  PostStatus,
  VideoIdea,
  VideoIdeaStatus,
} from '../../core/models/api.models';
import { ContentService } from './services/content.service';

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  other: 'Outra',
};

const POST_STATUS_LABELS: Record<PostStatus, string> = {
  idea: 'Ideia',
  producing: 'Produzindo',
  scheduled: 'Agendado',
  posted: 'Postado',
};

const IDEA_STATUS_LABELS: Record<VideoIdeaStatus, string> = {
  idea: 'Ideia',
  producing: 'Produzindo',
  posted: 'Postado',
};

@Injectable()
export class ContentViewModel {
  private readonly service = inject(ContentService);
  private readonly membersService = inject(MembersService);
  private readonly auth = inject(AuthService);

  readonly activeTab = signal<'posts' | 'ideas' | 'ai'>('posts');
  readonly posts = signal<ContentPost[]>([]);
  readonly ideas = signal<VideoIdea[]>([]);
  readonly members = signal<Member[]>([]);
  readonly isLoading = signal(true);
  readonly showPostForm = signal(false);
  readonly showIdeaForm = signal(false);

  readonly postPlatform = signal<Platform>('instagram');
  readonly postDate = signal('');
  readonly postTheme = signal('');
  readonly postResponsibleId = signal<number | null>(null);

  readonly ideaTitle = signal('');
  readonly ideaDescription = signal('');

  readonly aiPrompt = signal('');
  readonly aiIdeas = signal<AiIdea[]>([]);
  readonly aiLoading = signal(false);
  readonly aiError = signal('');
  readonly savedAiTitles = signal<string[]>([]);

  load(): void {
    this.isLoading.set(true);
    this.service.getPosts().subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
    this.service.getIdeas().subscribe((ideas) => this.ideas.set(ideas));
    this.membersService.getMembers().subscribe((members) => this.members.set(members));
  }

  openPostForm(): void {
    this.postPlatform.set('instagram');
    this.postDate.set('');
    this.postTheme.set('');
    this.postResponsibleId.set(this.auth.currentMember()?.id ?? null);
    this.showPostForm.set(true);
  }

  submitPostForm(): void {
    const responsibleId = this.postResponsibleId();
    if (!this.postTheme() || !this.postDate() || responsibleId === null) {
      return;
    }
    this.service
      .createPost({
        platform: this.postPlatform(),
        planned_date: this.postDate(),
        theme: this.postTheme(),
        responsible_id: responsibleId,
        status: 'idea',
        link: '',
      })
      .subscribe(() => {
        this.showPostForm.set(false);
        this.load();
      });
  }

  cyclePostStatus(post: ContentPost): void {
    const order: PostStatus[] = ['idea', 'producing', 'scheduled', 'posted'];
    const next = order[(order.indexOf(post.status) + 1) % order.length];
    this.service.updatePost(post.id, { status: next }).subscribe(() => this.load());
  }

  deletePost(post: ContentPost): void {
    this.service.deletePost(post.id).subscribe(() => this.load());
  }

  openIdeaForm(): void {
    this.ideaTitle.set('');
    this.ideaDescription.set('');
    this.showIdeaForm.set(true);
  }

  submitIdeaForm(): void {
    if (!this.ideaTitle()) {
      return;
    }
    this.service
      .createIdea({
        title: this.ideaTitle(),
        description: this.ideaDescription(),
        responsible_id: this.auth.currentMember()?.id ?? null,
        status: 'idea',
      })
      .subscribe(() => {
        this.showIdeaForm.set(false);
        this.load();
      });
  }

  cycleIdeaStatus(idea: VideoIdea): void {
    const order: VideoIdeaStatus[] = ['idea', 'producing', 'posted'];
    const next = order[(order.indexOf(idea.status) + 1) % order.length];
    this.service.updateIdea(idea.id, { status: next }).subscribe(() => this.load());
  }

  deleteIdea(idea: VideoIdea): void {
    this.service.deleteIdea(idea.id).subscribe(() => this.load());
  }

  generateAiIdeas(): void {
    const prompt = this.aiPrompt().trim();
    if (prompt.length < 3 || this.aiLoading()) {
      return;
    }
    this.aiLoading.set(true);
    this.aiError.set('');
    this.aiIdeas.set([]);
    this.savedAiTitles.set([]);
    this.service.generateAiIdeas(prompt).subscribe({
      next: (response) => {
        this.aiIdeas.set(response.ideas);
        this.aiLoading.set(false);
      },
      error: (err) => {
        this.aiError.set(err?.error?.detail ?? 'Falha ao gerar ideias. Tente novamente.');
        this.aiLoading.set(false);
      },
    });
  }

  saveAiIdea(idea: AiIdea): void {
    const description = [
      `Formato: ${idea.format}`,
      `Gancho: ${idea.hook}`,
      idea.description,
      `Legenda: ${idea.caption}`,
      `Hashtags: ${idea.hashtags.join(' ')}`,
      `Melhor horário: ${idea.best_time}`,
    ].join('\n');
    this.service
      .createIdea({
        title: idea.title,
        description,
        responsible_id: this.auth.currentMember()?.id ?? null,
        status: 'idea',
      })
      .subscribe(() => {
        this.savedAiTitles.update((titles) => [...titles, idea.title]);
        this.load();
      });
  }

  isAiIdeaSaved(idea: AiIdea): boolean {
    return this.savedAiTitles().includes(idea.title);
  }

  platformLabel(platform: Platform): string {
    return PLATFORM_LABELS[platform];
  }

  postStatusLabel(status: PostStatus): string {
    return POST_STATUS_LABELS[status];
  }

  ideaStatusLabel(status: VideoIdeaStatus): string {
    return IDEA_STATUS_LABELS[status];
  }
}

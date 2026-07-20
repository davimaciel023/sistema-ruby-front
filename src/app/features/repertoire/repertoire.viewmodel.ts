import { Injectable, computed, inject, signal } from '@angular/core';
import { Repertoire, Song } from '../../core/models/api.models';
import {
  RepertoireItemPayload,
  RepertoireService,
} from './services/repertoire.service';

interface BuilderItem {
  song: Song;
  performedKey: string;
}

@Injectable()
export class RepertoireViewModel {
  private readonly service = inject(RepertoireService);

  readonly activeTab = signal<'repertoires' | 'songs'>('repertoires');
  readonly songs = signal<Song[]>([]);
  readonly repertoires = signal<Repertoire[]>([]);
  readonly isLoading = signal(true);
  readonly expandedRepertoireId = signal<number | null>(null);
  readonly downloadingId = signal<number | null>(null);

  readonly showSongForm = signal(false);
  readonly editingSongId = signal<number | null>(null);
  readonly songTitle = signal('');
  readonly songArtist = signal('');
  readonly songKey = signal('');
  readonly songMinutes = signal<number | null>(null);
  readonly songSeconds = signal<number | null>(null);
  readonly songBpm = signal<number | null>(null);
  readonly songLyrics = signal('');
  readonly songChords = signal('');

  readonly showPdfPicker = signal(false);
  readonly pdfSelectedIds = signal<number[]>([]);
  readonly pdfDownloading = signal(false);

  readonly pdfSelectedTotalSeconds = computed(() => {
    const selected = new Set(this.pdfSelectedIds());
    return this.repertoires()
      .filter((rep) => selected.has(rep.id))
      .reduce((total, rep) => total + rep.total_seconds, 0);
  });

  readonly showBuilder = signal(false);
  readonly builderName = signal('');
  readonly builderDate = signal('');
  readonly builderGap = signal(30);
  readonly builderItems = signal<BuilderItem[]>([]);
  readonly builderSearch = signal('');

  readonly builderTotalSeconds = computed(() => {
    const items = this.builderItems();
    const songsTotal = items.reduce((total, item) => total + item.song.duration_seconds, 0);
    const gaps = Math.max(items.length - 1, 0) * this.builderGap();
    return songsTotal + gaps;
  });

  readonly availableSongs = computed(() => {
    const chosen = new Set(this.builderItems().map((item) => item.song.id));
    const query = this.builderSearch().toLowerCase();
    return this.songs().filter(
      (song) =>
        !chosen.has(song.id) &&
        (query === '' || song.title.toLowerCase().includes(query)),
    );
  });

  load(): void {
    this.isLoading.set(true);
    this.service.getRepertoires().subscribe({
      next: (repertoires) => {
        this.repertoires.set(repertoires);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
    this.service.getSongs().subscribe((songs) => this.songs.set(songs));
  }

  openSongForm(song?: Song): void {
    this.editingSongId.set(song?.id ?? null);
    this.songTitle.set(song?.title ?? '');
    this.songArtist.set(song?.original_artist ?? '');
    this.songKey.set(song?.key ?? '');
    this.songMinutes.set(song ? Math.floor(song.duration_seconds / 60) : null);
    this.songSeconds.set(song ? song.duration_seconds % 60 : null);
    this.songBpm.set(song?.bpm ?? null);
    this.songLyrics.set(song?.lyrics ?? '');
    this.songChords.set(song?.chords ?? '');
    this.showSongForm.set(true);
  }

  closeSongForm(): void {
    this.showSongForm.set(false);
  }

  submitSongForm(): void {
    const minutes = this.songMinutes() ?? 0;
    const seconds = this.songSeconds() ?? 0;
    const duration = minutes * 60 + seconds;
    if (!this.songTitle() || !this.songKey() || duration <= 0) {
      return;
    }
    const payload = {
      title: this.songTitle(),
      original_artist: this.songArtist(),
      key: this.songKey(),
      duration_seconds: duration,
      bpm: this.songBpm(),
      lyrics: this.songLyrics(),
      chords: this.songChords(),
      notes: '',
    };
    const editingId = this.editingSongId();
    const request =
      editingId === null
        ? this.service.createSong(payload)
        : this.service.updateSong(editingId, payload);
    request.subscribe(() => {
      this.showSongForm.set(false);
      this.load();
    });
  }

  deleteSong(song: Song): void {
    this.service.deleteSong(song.id).subscribe(() => this.load());
  }

  openBuilder(): void {
    this.builderName.set('');
    this.builderDate.set('');
    this.builderGap.set(30);
    this.builderItems.set([]);
    this.builderSearch.set('');
    this.showBuilder.set(true);
  }

  closeBuilder(): void {
    this.showBuilder.set(false);
  }

  addToBuilder(song: Song): void {
    this.builderItems.update((items) => [...items, { song, performedKey: song.key }]);
  }

  removeFromBuilder(index: number): void {
    this.builderItems.update((items) => items.filter((_, i) => i !== index));
  }

  moveInBuilder(index: number, direction: -1 | 1): void {
    this.builderItems.update((items) => {
      const target = index + direction;
      if (target < 0 || target >= items.length) {
        return items;
      }
      const copy = [...items];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  setPerformedKey(index: number, key: string): void {
    this.builderItems.update((items) =>
      items.map((item, i) => (i === index ? { ...item, performedKey: key } : item)),
    );
  }

  submitBuilder(): void {
    if (!this.builderName() || this.builderItems().length === 0) {
      return;
    }
    const items: RepertoireItemPayload[] = this.builderItems().map((item) => ({
      song_id: item.song.id,
      performed_key: item.performedKey || null,
    }));
    this.service
      .createRepertoire({
        name: this.builderName(),
        date: this.builderDate() || null,
        gap_seconds: this.builderGap(),
        notes: '',
        items,
      })
      .subscribe(() => {
        this.showBuilder.set(false);
        this.load();
      });
  }

  deleteRepertoire(repertoire: Repertoire): void {
    this.service.deleteRepertoire(repertoire.id).subscribe(() => this.load());
  }

  toggleExpand(repertoireId: number): void {
    this.expandedRepertoireId.update((current) =>
      current === repertoireId ? null : repertoireId,
    );
  }

  downloadPdf(repertoire: Repertoire): void {
    this.downloadingId.set(repertoire.id);
    this.service.downloadPdf(repertoire.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `repertorio-${repertoire.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
        this.downloadingId.set(null);
      },
      error: () => this.downloadingId.set(null),
    });
  }

  openPdfPicker(): void {
    this.pdfSelectedIds.set([]);
    this.showPdfPicker.set(true);
  }

  closePdfPicker(): void {
    this.showPdfPicker.set(false);
  }

  togglePdfSelection(repertoireId: number): void {
    this.pdfSelectedIds.update((ids) =>
      ids.includes(repertoireId)
        ? ids.filter((id) => id !== repertoireId)
        : [...ids, repertoireId],
    );
  }

  isPdfSelected(repertoireId: number): boolean {
    return this.pdfSelectedIds().includes(repertoireId);
  }

  downloadCombinedPdf(): void {
    const ids = this.pdfSelectedIds();
    if (ids.length === 0 || this.pdfDownloading()) {
      return;
    }
    this.pdfDownloading.set(true);
    this.service.downloadCombinedPdf(ids).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'repertorio-do-show.pdf';
        anchor.click();
        URL.revokeObjectURL(url);
        this.pdfDownloading.set(false);
        this.showPdfPicker.set(false);
      },
      error: () => this.pdfDownloading.set(false),
    });
  }

  formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
    }
    return `${minutes}min ${seconds.toString().padStart(2, '0')}s`;
  }
}

import { Injectable, signal, computed } from '@angular/core';
import { HistoryEntry } from '../models/snippet.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  // In-memory only — no localStorage. Supabase is the source of truth.
  private _history = signal<HistoryEntry[]>([]);
  private _loading = signal<boolean>(false);

  history = this._history.asReadonly();
  loading = this._loading.asReadonly();
  pinnedCount = computed(() => this._history().filter(h => h.isPinned).length);

  addEntry(entry: HistoryEntry) {
    this._history.update(h => [entry, ...h.filter(e => e.id !== entry.id)]);
  }

  removeEntry(id: string) {
    this._history.update(h => h.filter(e => e.id !== id));
  }

  togglePin(id: string) {
    this._history.update(h => h.map(e => e.id === id ? { ...e, isPinned: !e.isPinned } : e));
  }

  /** Called after login — replaces in-memory history with the user's cloud data */
  mergeEntries(cloudEntries: HistoryEntry[], userId: string) {
    this._history.set(cloudEntries);
    this._loading.set(false);
  }

  /** Show spinner while history is loading from Supabase */
  setLoading(val: boolean) {
    this._loading.set(val);
  }

  /** Called on logout — clears in-memory history */
  clearHistory() {
    this._history.set([]);
    this._loading.set(false);
  }
}

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryService } from '../../services/history.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { HistoryEntry } from '../../models/snippet.model';
import { RouterLink } from '@angular/router';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="history-page wrap page-container">
      @if (!auth.isLoggedIn()) {
        <div class="empty-state">
          <p style="font-size:48px;margin-bottom:16px">🔒</p>
          <p class="mono muted">Sign in with Google to view your personal history.</p>
        </div>
      } @else {
        @if (historyService.loading()) {
          <div class="empty-state">
            <div class="spinner"></div>
            <p class="mono muted">Loading your history...</p>
          </div>
        } @else {
        <div class="history-header">
          <h1 class="display">YOUR HISTORY</h1>
          <div class="search-box">
            <input type="text" placeholder="Search snippets..." (input)="onSearch($event)">
          </div>
        </div>

        @if (filteredHistory().length === 0) {
          <div class="empty-state">
            <p class="mono muted">No snippets found in your history.</p>
          </div>
        } @else {
          <div class="history-grid">
            @for (entry of filteredHistory(); track entry.id) {
              <div class="history-card" [class.pinned]="entry.isPinned">
                <div class="card-header">
                  <span class="lang-badge">{{ entry.lang.toUpperCase() }}</span>
                  <div class="actions">
                    <button class="pin-btn" (click)="togglePin(entry.id); $event.preventDefault()" [class.active]="entry.isPinned">
                      {{ entry.isPinned ? '★' : '☆' }}
                    </button>
                    <button class="delete-btn" (click)="deleteEntry(entry.id); $event.preventDefault()">&times;</button>
                  </div>
                </div>
                
                <a [routerLink]="['/view', entry.snippetId]" class="card-body">
                  <h3 class="snippet-title">{{ entry.title }}</h3>
                  <pre class="preview-text">{{ entry.preview }}...</pre>
                </a>

                <div class="card-footer">
                  <div class="meta">
                    <span class="date">{{ entry.createdAt | date:'shortDate' }}</span>
                    @if (entry.expiresAt) {
                      <span class="expiry" [class.urgent]="isExpiringSoon(entry.expiresAt)">
                        Expires: {{ entry.expiresAt | date:'shortDate' }}
                      </span>
                    }
                  </div>
                  <div class="stats">
                    <span>{{ entry.fileCount }} files</span>
                    <span>{{ entry.views }} views</span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
        }
      }
    </div>
  `,
  styles: [`
    .history-page { 
      padding-top: 40px; 
    }
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .search-box {
      width: 100%;
      max-width: 400px;
    }

    .search-box input {
      background: var(--ink3);
      border: 1px solid var(--wire);
      color: var(--white);
      padding: 10px 16px;
      border-radius: 8px;
      width: 100%;
      outline: none;
      &:focus { border-color: var(--v); }
    }

    .history-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .history-card {
      background: var(--ink2);
      border: 1px solid var(--wire);
      border-radius: var(--radius-md, 12px);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, border-color 0.2s;
      text-decoration: none;

      &:hover {
        transform: translateY(-4px);
        border-color: var(--v);
      }

      &.pinned { border-color: var(--v); box-shadow: 0 0 15px rgba(123, 94, 167, 0.2); }
    }

    .card-header {
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255,255,255,0.03);
    }

    .lang-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--v);
      background: rgba(123, 94, 167, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .actions { display: flex; gap: 8px; }
    .pin-btn, .delete-btn {
      background: none; border: none; color: var(--dim); cursor: pointer; font-size: 16px;
      &:hover { color: var(--white); }
      &.active { color: var(--v); }
    }

    .card-body {
      padding: 16px;
      flex: 1;
      text-decoration: none;
      color: inherit;
    }

    .snippet-title { margin-bottom: 8px; font-size: 20px; color: var(--white); }
    .preview-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--muted);
      background: var(--ink);
      padding: 8px;
      border-radius: 4px;
      margin: 0;
      white-space: pre-wrap;
      max-height: 80px;
      overflow: hidden;
    }

    .card-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--wire);
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--dim);
    }

    .meta { display: flex; flex-direction: column; gap: 2px; }
    .expiry.urgent { color: var(--coral); }
    .stats { display: flex; flex-direction: column; text-align: right; gap: 2px; }

    .empty-state { text-align: center; padding: 100px 0; }
  `]
})
export class HistoryComponent {
  historyService = inject(HistoryService);
  toast = inject(ToastService);
  auth = inject(AuthService);
  confirm = inject(ConfirmService);
  
  searchQuery = signal('');

  filteredHistory = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const all = this.historyService.history();
    if (!query) return all;
    return all.filter(e => 
      e.title.toLowerCase().includes(query) || 
      e.lang.toLowerCase().includes(query) ||
      (e.slug && e.slug.toLowerCase().includes(query))
    );
  });

  onSearch(e: Event) {
    this.searchQuery.set((e.target as HTMLInputElement).value);
  }

  togglePin(id: string) {
    this.historyService.togglePin(id);
  }

  async deleteEntry(id: string) {
    const confirmed = await this.confirm.confirm({
      title: 'Delete Snippet',
      message: 'Are you sure you want to remove this snippet from your history? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Keep'
    });

    if (confirmed) {
      try {
        await this.historyService.removeEntry(id);
        this.toast.success('Snippet removed from history');
      } catch (e) {
        this.toast.error('Failed to remove snippet from cloud history');
      }
    }
  }

  isExpiringSoon(date: Date): boolean {
    const diff = date.getTime() - Date.now();
    return diff < 48 * 60 * 60 * 1000; // 48 hours
  }
}

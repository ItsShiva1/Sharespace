import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { SnippetService } from '../../services/snippet.service';
import { SnippetEntry } from '../../models/snippet.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="view-viewport page-container">
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p class="mono">Fetching snippet from orbit...</p>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <div class="icon">🚫</div>
          <h2 class="display">Snippet Not Found</h2>
          <p class="dim">This link may have expired or the snippet was deleted.</p>
          <button class="btn-primary" routerLink="/editor">Create Your Own</button>
        </div>
      } @else if (snippet()) {
        <div class="container">
          <header class="view-header">
            <div class="meta">
              <h1 class="display">{{ snippet()?.title }}</h1>
              <div class="badges">
                <span class="badge lang">{{ snippet()?.lang?.toUpperCase() }}</span>
                <span class="badge date">{{ snippet()?.createdAt | date:'medium' }}</span>
                <span class="badge views">{{ snippet()?.views }} views</span>
              </div>
            </div>
            <div class="actions">
              <button class="btn" (click)="copyCode()">Copy Code</button>
              <button class="btn" (click)="copyLink()">Copy Share URL</button>
              <button class="btn primary" (click)="forkSnippet()">Fork & Edit</button>
            </div>
          </header>

          <main class="view-content">
            <div class="tabs">
              @for (tab of snippet()?.tabs; track tab.id) {
                <div class="tab" [class.active]="activeTabId() === tab.id" (click)="activeTabId.set(tab.id)">
                  {{ tab.name }}
                </div>
              }
            </div>
            
            <div class="code-container">
              <pre class="code-block"><code>{{ activeTabContent() }}</code></pre>
            </div>
          </main>

          @if (snippet()?.uploads && snippet()!.uploads.length > 0) {
            <section class="attachments-section">
              <h3 class="display">Attached Files</h3>
              <div class="file-grid">
                @for (file of snippet()?.uploads; track file.id) {
                  <div class="file-card">
                    <div class="file-info">
                      <span class="file-icon">{{ isImage(file.type) ? '🖼️' : '📄' }}</span>
                      <div class="details">
                        <p class="name">{{ file.name }}</p>
                        <p class="size mono">{{ formatSize(file.size) }}</p>
                      </div>
                    </div>
                    <div class="file-actions">
                      @if (isImage(file.type)) {
                        <button class="btn-sm" (click)="selectedImageUrl.set(file.url)">View</button>
                      }
                      <button class="btn-sm primary" (click)="downloadFile(file)">Download</button>
                    </div>
                  </div>
                }
              </div>
            </section>
          }
          
          <footer class="view-footer">
            <p class="dim">Expires on {{ snippet()?.expiresAt | date:'longDate' }}</p>
          </footer>
        </div>

        <!-- Image Preview Modal -->
        @if (selectedImageUrl()) {
          <div class="modal-overlay" (click)="selectedImageUrl.set(null)">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <button class="modal-close" (click)="selectedImageUrl.set(null)">&times;</button>
              <img [src]="selectedImageUrl()" alt="Preview">
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--ink); color: var(--paper); }
    
    .view-viewport {
      padding: 64px 24px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .loading-state, .error-state {
      height: 60vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 24px;
    }

    .spinner {
      width: 40px; height: 40px;
      border: 3px solid var(--wire);
      border-top-color: var(--v);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .view-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      flex-wrap: wrap;
      gap: 24px;
      
      .meta {
        h1 { font-size: clamp(24px, 6vw, 32px); margin-bottom: 12px; }
        .badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          padding: 2px 8px;
          background: var(--ink2);
          border: 1px solid var(--wire);
          border-radius: 4px;
          color: var(--dim);
          &.lang { color: var(--v); border-color: var(--v); }
        }
      }

      .actions { 
        display: flex; 
        gap: 12px;
        width: 100%;
        @media (min-width: 769px) { width: auto; }
        .btn { flex: 1; text-align: center; }
      }
    }

    .btn {
      background: var(--ink3);
      border: 1px solid var(--wire);
      color: var(--white);
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
      &.primary { background: var(--v); border-color: var(--vo); }
      &:hover { transform: translateY(-2px); opacity: 0.9; }
    }

    .view-content {
      background: var(--ink2);
      border: 1px solid var(--wire);
      border-radius: 16px;
      overflow: hidden;
      
      .tabs {
        display: flex;
        background: var(--ink3);
        border-bottom: 1px solid var(--wire);
        .tab {
          padding: 12px 24px;
          font-size: 13px;
          color: var(--dim);
          cursor: pointer;
          border-right: 1px solid var(--wire);
          &:hover { color: var(--paper); }
          &.active { background: var(--ink2); color: var(--white); border-bottom: 2px solid var(--v); }
        }
      }
      
      .code-container {
        padding: 24px;
        max-height: 600px;
        overflow-y: auto;
        .code-block {
          margin: 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          line-height: 1.6;
          color: var(--paper);
          white-space: pre-wrap;
        }
      }
    }

    .view-footer {
      margin-top: 24px;
      text-align: right;
      font-size: 12px;
    }

    .attachments-section {
      margin-top: 48px;
      h3 { font-size: 24px; margin-bottom: 20px; }
    }

    .file-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .file-card {
      background: var(--ink2);
      border: 1px solid var(--wire);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: border-color 0.2s;
      &:hover { border-color: var(--v); }
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 12px;
      .file-icon { font-size: 24px; }
      .details {
        .name { color: var(--paper); font-weight: 500; font-size: 14px; margin-bottom: 2px; }
        .size { font-size: 11px; color: var(--dim); }
      }
    }

    .file-actions {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }

    .btn-sm {
      background: var(--ink3);
      border: 1px solid var(--wire);
      color: var(--paper);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 13px;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
      &.primary { background: var(--v); border-color: var(--vo); color: var(--white); }
      &:hover { opacity: 0.9; transform: translateY(-1px); }
    }

    /* ── MODAL ── */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      animation: fadeIn 0.3s ease;
    }

    .modal-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      background: var(--ink2);
      border: 1px solid var(--wire);
      border-radius: 20px;
      padding: 10px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      
      img { 
        display: block; 
        max-width: 100%; 
        max-height: 80vh; 
        border-radius: 12px;
        object-fit: contain;
      }
    }

    .modal-close {
      position: absolute; top: -48px; right: 0;
      background: none; border: none; color: white;
      font-size: 32px; cursor: pointer;
      &:hover { color: var(--v); }
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class ViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabase = inject(SupabaseService);
  private snippetService = inject(SnippetService);
  private toast = inject(ToastService);

  snippet = signal<SnippetEntry | null>(null);
  loading = signal(true);
  error = signal(false);
  activeTabId = signal<string>('');
  selectedImageUrl = signal<string | null>(null);

  activeTabContent = () => {
    const s = this.snippet();
    if (!s) return '';
    return s.tabs.find(t => t.id === this.activeTabId())?.content || '';
  };

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.fetchSnippet(id);
      }
    });
  }

  async fetchSnippet(id: string) {
    try {
      this.loading.set(true);
      this.error.set(false);
      
      // 1. Try fetching from snippets table (detailed code snippet)
      const data = await this.supabase.getSnippet(id);
      
      if (data) {
        this.snippet.set(data as any);
        if (data.tabs && data.tabs.length > 0) {
          this.activeTabId.set(data.tabs[0].id);
        }
        return;
      }

      // 2. Fallback to history table (could be a standalone file upload)
      const historyEntry = await this.supabase.getHistoryEntryById(id);
      if (historyEntry && historyEntry.uploadCount > 0 && historyEntry.fileCount === 0) {
        // Construct a virtual SnippetEntry for the file upload
        this.snippet.set({
          id: historyEntry.snippetId,
          title: historyEntry.title,
          tabs: [],
          uploads: [{
            id: historyEntry.id,
            name: historyEntry.title.replace('📎 ', ''),
            size: 0, // Size not in history, but that's okay for display
            type: historyEntry.lang,
            url: historyEntry.shareUrl,
            uploadedAt: historyEntry.createdAt
          }],
          createdAt: historyEntry.createdAt,
          updatedAt: historyEntry.createdAt,
          expiresAt: historyEntry.expiresAt,
          lang: historyEntry.lang,
          isPublic: true,
          isReadOnly: true,
          hasPassword: false,
          views: historyEntry.views,
          shareUrl: historyEntry.shareUrl,
          tags: historyEntry.tags,
          version: 1,
          encryptionEnabled: false
        });
      } else {
        console.warn(`Snippet or file with ID ${id} not found.`);
        this.error.set(true);
      }
    } catch (e) {
      console.error('Failed to fetch snippet:', e);
      this.toast.error('Connection error while fetching snippet');
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    this.toast.success('Share link copied to clipboard!');
  }

  copyCode() {
    const content = this.activeTabContent();
    if (content) {
      navigator.clipboard.writeText(content);
      this.toast.success('Code copied to clipboard!');
    } else {
      this.toast.warning('No code to copy');
    }
  }

  forkSnippet() {
    const s = this.snippet();
    if (s) {
      this.snippetService.loadSnippet(s);
      this.router.navigate(['/editor']);
      this.toast.success('Snippet loaded into editor!');
    }
  }

  isImage(type: string): boolean {
    return type?.startsWith('image/');
  }

  formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async downloadFile(file: any) {
    try {
      this.toast.info(`Starting download: ${file.name}`);
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      this.toast.success('Download complete!');
    } catch (e) {
      console.error('Download failed:', e);
      this.toast.error('Download failed. Using direct link fallback.');
      window.open(file.url, '_blank');
    }
  }
}

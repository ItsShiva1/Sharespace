import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HistoryService } from '../../services/history.service';
import { SupabaseService } from '../../services/supabase.service';
import { HistoryEntry, SnippetEntry } from '../../models/snippet.model';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="viewer-page wrap">
      @if (loading()) {
        <div class="loader">Loading snippet...</div>
      } @else if (entry()) {
        <div class="viewer-header">
          <div class="title-section">
            <h1 class="display">{{ entry()?.title }}</h1>
            <div class="meta mono">
              <span>{{ entry()?.lang?.toUpperCase() }}</span>
              <span>•</span>
              <span>Created {{ entry()?.createdAt | date:'medium' }}</span>
              @if (entry()?.expiresAt) {
                 <span>•</span>
                 <span class="expiry">Expires: {{ entry()?.expiresAt | date:'medium' }}</span>
              }
            </div>
          </div>
          <div class="actions">
            <button class="btn" (click)="copyLink()">Copy Share Link</button>
            <a routerLink="/" class="btn primary">Fork & Edit</a>
          </div>
        </div>

        <div class="viewer-content">
          <div class="file-tabs">
             <div class="tab active">
               {{ entry()?.lang === 'javascript' ? 'main.js' : 'file.' + entry()?.lang }}
             </div>
          </div>
          <div class="code-area">
            <pre><code>{{ entry()?.preview }}...</code></pre>
            <div class="overlay-note mono">Full multi-file viewing coming in Phase 1.5</div>
          </div>
        </div>

        @if (entry()?.uploadCount && entry()!.uploadCount > 0) {
          <div class="attachments-mini">
            <h4 class="mono muted uppercase">Attached Files ({{ entry()?.uploadCount }})</h4>
            <div class="mini-file-list">
              <!-- Since HistoryEntry only has uploadCount, in a real app we might need to fetch the full snippet 
                   to get the actual file links, but for now we rely on the snippet details if available. 
                   Actually, ViewerComponent now fetches the full snippet from Supabase and maps it. -->
              @if (entry()?.uploads) {
                @for (file of entry()?.uploads; track file.id) {
                  <div class="mini-file-item">
                    <span class="mono">{{ file.name }}</span>
                    <button class="download-link-btn" (click)="downloadFile(file)">Download</button>
                  </div>
                }
              } @else {
                <p class="mono muted">Details available in full view.</p>
              }
            </div>
          </div>
        }
      } @else {
        <div class="error-state">
          <h2 class="display">SNIPPET NOT FOUND</h2>
          <p class="mono muted">The link may have expired or was deleted.</p>
          <a routerLink="/" class="btn primary">Back to Editor</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .viewer-page { 
      padding-top: 60px; 
      height: calc(100vh - var(--header-height));
      overflow-y: auto;
    }
    .viewer-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
    }
    .title-section h1 { font-size: 48px; margin-bottom: 8px; }
    .meta { display: flex; gap: 12px; color: var(--dim); font-size: 13px; }
    .expiry { color: var(--coral); }
    
    .viewer-content {
      background: var(--ink2);
      border: 1px solid var(--wire);
      border-radius: var(--radius-lg, 16px);
      overflow: hidden;
    }

    .file-tabs {
      height: 48px;
      background: var(--ink3);
      display: flex;
      border-bottom: 1px solid var(--wire);
      padding: 0 16px;
      align-items: flex-end;
    }

    .tab {
      height: 36px; padding: 0 20px; background: var(--ink2); border: 1px solid var(--wire);
      border-bottom: none; border-radius: 8px 8px 0 0; display: flex; align-items: center;
      font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--white);
    }

    .code-area {
      padding: 24px; position: relative;
      pre { margin: 0; color: var(--v); font-family: 'JetBrains Mono', monospace; font-size: 14px; }
    }

    .overlay-note {
      margin-top: 24px; padding: 12px; background: rgba(123, 94, 167, 0.1);
      border: 1px dashed var(--v); border-radius: 8px; color: var(--vo); text-align: center;
    }

    .btn {
      background: var(--ink3); border: 1px solid var(--wire); color: var(--white);
      padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;
      text-decoration: none; display: inline-block;
      &.primary { background: var(--v); border-color: var(--vo); margin-left:12px; }
    }

    .loader, .error-state { text-align: center; padding: 100px 0; }

    .attachments-mini {
      margin-top: 32px;
      h4 { font-size: 11px; margin-bottom: 12px; letter-spacing: 1px; }
    }

    .mini-file-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mini-file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: var(--ink3);
      border: 1px solid var(--wire);
      border-radius: 6px;
      font-size: 12px;
      .download-link-btn { 
        background: none; border: none; padding: 0;
        color: var(--v); font-family: inherit; font-size: inherit; cursor: pointer;
        &:hover { text-decoration: underline; } 
      }
    }
    .uppercase { text-transform: uppercase; }
  `]
})
export class ViewerComponent implements OnInit {
  route = inject(ActivatedRoute);
  historyService = inject(HistoryService);
  supabase = inject(SupabaseService);
  
  loading = signal(true);
  entry = signal<HistoryEntry | null>(null);

  async ngOnInit() {
    const id = this.route.snapshot.params['id'] || this.route.snapshot.params['slug'];
    
    // 1. Try local history first (fast)
    const found = this.historyService.history().find(e => e.snippetId === id || e.id === id);
    if (found) {
      this.entry.set(found);
      this.loading.set(false);
      return;
    }

    // 2. Fallback to Supabase cloud
    try {
      const cloudSnippet = await this.supabase.getSnippet(id);
      if (cloudSnippet) {
        // Map SnippetEntry to HistoryEntry for the simple viewer
        const mapped: HistoryEntry = {
          id: cloudSnippet.id,
          snippetId: cloudSnippet.id,
          title: cloudSnippet.title,
          lang: cloudSnippet.lang,
          preview: cloudSnippet.tabs[0]?.content.substring(0, 150) || '',
          createdAt: cloudSnippet.createdAt,
          expiresAt: cloudSnippet.expiresAt,
          fileCount: cloudSnippet.tabs.length,
          uploadCount: cloudSnippet.uploads?.length || 0,
          isPinned: false,
          shareUrl: cloudSnippet.shareUrl,
          views: cloudSnippet.views,
          tags: cloudSnippet.tags || [],
          uploads: cloudSnippet.uploads
        };
        this.entry.set(mapped);
      } else {
        // 3. Last resort: Try history table directly (for file uploads)
        const historyEntry = await this.supabase.getHistoryEntryById(id);
        if (historyEntry) {
          // If it's a file upload, we can still show a download link
          this.entry.set({
            ...historyEntry,
            uploads: historyEntry.uploadCount > 0 ? [{
              id: historyEntry.id,
              name: historyEntry.title.replace('📎 ', ''),
              size: 0,
              type: historyEntry.lang,
              url: historyEntry.shareUrl,
              uploadedAt: historyEntry.createdAt
            }] : []
          });
        } else {
          this.entry.set(null);
        }
      }
    } catch (e) {
      console.error('Error fetching snippet in ViewerComponent:', e);
      this.entry.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async downloadFile(file: any) {
    try {
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
    } catch (e) {
      console.error('Download failed:', e);
      window.open(file.url, '_blank');
    }
  }

  copyLink() {
    if (this.entry()) {
      navigator.clipboard.writeText(this.entry()!.shareUrl);
      alert('Link copied to clipboard!');
    }
  }
}

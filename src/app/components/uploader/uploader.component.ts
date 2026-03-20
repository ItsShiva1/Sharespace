import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UploadService } from '../../services/upload.service';
import { ToastService } from '../../services/toast.service';
import { HistoryService } from '../../services/history.service';
import { SupabaseService } from '../../services/supabase.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-uploader',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="uploader-viewport page-container">
      <div class="header-strip">
        <h2 class="display">Cloud Upload</h2>
        <p class="mono muted">Securely persist files to your ShareSpace cloud</p>
      </div>

      <div class="uploader-container">
        @if (!auth.isLoggedIn() || auth.user()?.isAnonymous) {
          <!-- Login Gate -->
          <div class="prime-gate">
            <div class="lock-icon">🔒</div>
            <h3 class="display">Login Required</h3>
            <p class="dim">Sign in with Google to upload and persist your files to the cloud.</p>
            <button class="btn-prime" routerLink="/">Sign In</button>
          </div>
        } @else {
          <!-- Actual Uploader -->
          <div class="drop-zone" 
               [class.active]="isDragging()" 
               (dragover)="onDragOver($event)" 
               (dragleave)="onDragLeave()" 
               (drop)="onDrop($event)">
            <input type="file" #fileInput (change)="onFileSelected($event)" hidden multiple>
            <div class="dz-content" (click)="fileInput.click()">
              <div class="icon">☁️</div>
              <p>Drag & drop files here or <span class="highlight">browse</span></p>
              <span class="sub">Max 50MB per file</span>
            </div>
          </div>

          @if (uploads().length > 0) {
            <div class="upload-list">
              @for (file of uploads(); track file.name) {
                <div class="upload-item">
                  <div class="file-info">
                    <span class="name">{{ file.name }}</span>
                    <span class="size">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</span>
                  </div>
                  <div class="progress-bar">
                    <div class="fill" [style.width]="(file.progress || 0) + '%'"></div>
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; background: var(--ink); }
    
    .uploader-viewport {
      padding: 48px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header-strip {
      margin-bottom: 40px;
      h2 { font-size: 32px; letter-spacing: 2px; }
    }

    .uploader-container {
      background: var(--ink2);
      border: 1px solid var(--wire);
      border-radius: 24px;
      min-height: 400px;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    .prime-gate {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px;
      background: rgba(10, 10, 11, 0.8);
      backdrop-filter: blur(12px);

      .lock-icon { font-size: 48px; margin-bottom: 24px; }
      h3 { font-size: 28px; margin-bottom: 12px; }
      p { max-width: 300px; margin-bottom: 32px; line-height: 1.6; }
    }

    .btn-prime {
      background: var(--v);
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 8px 16px rgba(123, 94, 167, 0.3);
      transition: transform 0.2s;
      &:hover { transform: translateY(-2px); }
    }

    .drop-zone {
      flex: 1;
      margin: 24px;
      border: 2px dashed var(--wire);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &.active { border-color: var(--v); background: rgba(123, 94, 167, 0.05); }
      &:hover { border-color: var(--dim); }
    }

    .dz-content {
      text-align: center;
      .icon { font-size: 40px; margin-bottom: 16px; }
      p { font-size: 18px; color: var(--paper); .highlight { color: var(--v); font-weight: 600; } }
      .sub { font-size: 12px; color: var(--muted); margin-top: 8px; display: block; }
    }

    .upload-list {
      padding: 0 24px 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .upload-item {
      background: var(--ink3);
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid var(--wire);

      .file-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 13px;
        .name { color: var(--white); }
        .size { color: var(--dim); }
      }

      .progress-bar {
        height: 4px;
        background: var(--ink4);
        border-radius: 2px;
        overflow: hidden;
        .fill { height: 100%; background: var(--v); transition: width 0.3s; }
      }
    }
  `]
})
export class UploaderComponent {
  auth = inject(AuthService);
  uploader = inject(UploadService);
  toast = inject(ToastService);
  history = inject(HistoryService);
  supabase = inject(SupabaseService);

  isDragging = signal(false);
  uploads = signal<any[]>([]);

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    const files = e.dataTransfer?.files;
    if (files) this.handleFiles(files);
  }

  onFileSelected(e: any) {
    const files = e.target.files;
    if (files) this.handleFiles(files);
  }

  private async handleFiles(files: FileList) {
    const fileList = Array.from(files);
    for (const file of fileList) {
      const uploadIdx = this.uploads().length;
      this.uploads.update(u => [...u, { name: file.name, size: file.size, progress: 0 }]);
      
      let interval: any;
      try {
        // Mock progress for UI feedback
        interval = setInterval(() => {
          this.uploads.update(u => {
            const copy = [...u];
            if (copy[uploadIdx].progress < 90) copy[uploadIdx].progress += 10;
            return copy;
          });
        }, 100);

        const uploaded = await this.uploader.uploadFile(file);
        
        this.uploads.update(u => {
          const copy = [...u];
          copy[uploadIdx].progress = 100;
          return copy;
        });

        // Build history entry for this upload
        const historyEntry = {
          id: uploaded.id,
          snippetId: uploaded.id,
          title: `📎 ${uploaded.name}`,
          lang: uploaded.type || 'file',
          preview: `${(uploaded.size / 1024).toFixed(1)} KB`,
          createdAt: uploaded.uploadedAt,
          expiresAt: null,
          fileCount: 0,
          uploadCount: 1,
          isPinned: false,
          shareUrl: uploaded.url,
          views: 0,
          tags: ['upload']
        };

        // Add to in-memory history immediately
        this.history.addEntry(historyEntry);

        // Persist to Supabase if logged in
        const user = this.auth.user();
        if (user) {
          this.supabase.saveHistoryEntry(user.id, historyEntry).catch(e =>
            console.warn('Could not save upload to cloud history:', e)
          );
        }
      } catch (e: any) {
        console.error(e);
        this.toast.error(`Failed to upload ${file.name}. Check your CORS settings.`);
        this.uploads.update(u => u.filter((_, i) => i !== uploadIdx));
      } finally {
        if (interval) clearInterval(interval);
      }
    }
  }
}

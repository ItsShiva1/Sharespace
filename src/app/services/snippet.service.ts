import { Injectable, signal, computed, inject, Injector } from '@angular/core';
import { FileTab, UploadedFile, SnippetEntry, HistoryEntry } from '../models/snippet.model';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SnippetService {
  private _tabs = signal<FileTab[]>([this.createDefaultTab()]);
  private _uploads = signal<UploadedFile[]>([]);
  private _title = signal<string>('Untitled Snippet');
  
  tabs = this._tabs.asReadonly();
  uploads = this._uploads.asReadonly();
  title = this._title.asReadonly();

  activeTab = computed(() => this._tabs().find(t => t.isActive) || this._tabs()[0]);
  
  totalChars = computed(() => this._tabs().reduce((acc, tab) => acc + tab.content.length, 0));
  fileCount = computed(() => this._tabs().length);
  uploadCount = computed(() => this._uploads().length);

  private supabase = inject(SupabaseService);
  private auth = inject(AuthService);

  constructor() {}

  addTab(name = 'new_file.js', lang = 'javascript') {
    const newTab: FileTab = {
      id: crypto.randomUUID(),
      name,
      content: '',
      language: lang,
      isActive: true
    };
    
    // Deactivate others
    this._tabs.update(tabs => tabs.map(t => ({ ...t, isActive: false })).concat(newTab));
  }

  removeTab(id: string) {
    this._tabs.update(tabs => {
      const filtered = tabs.filter(t => t.id !== id);
      if (filtered.length === 0) return [this.createDefaultTab()];
      
      // If we removed the active one, pick the last one
      if (!filtered.find(t => t.isActive)) {
        filtered[filtered.length - 1].isActive = true;
      }
      return filtered;
    });
  }

  setActiveTab(id: string) {
    this._tabs.update(tabs => tabs.map(t => ({
      ...t,
      isActive: t.id === id
    })));
  }

  updateTabContent(id: string, content: string) {
    this._tabs.update(tabs => tabs.map(t => t.id === id ? { ...t, content } : t));
  }

  updateTabName(id: string, name: string) {
    this._tabs.update(tabs => tabs.map(t => t.id === id ? { ...t, name } : t));
  }

  updateTabLanguage(id: string, language: string) {
    this._tabs.update(tabs => tabs.map(t => t.id === id ? { ...t, language } : t));
  }

  addUpload(file: UploadedFile) {
    this._uploads.update(u => [...u, file]);
  }

  removeUpload(id: string) {
    this._uploads.update(u => u.filter(f => f.id !== id));
  }

  setTitle(title: string) {
    this._title.set(title);
  }

  async saveToCloud() {
    const id = crypto.randomUUID();
    const activeTab = this.activeTab();
    
    // 1. Create the full Snippet Entry (The actual code)
    const snippet: SnippetEntry = {
      id,
      title: this._title(),
      tabs: this._tabs(),
      uploads: this._uploads(),
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      lang: activeTab.language,
      isPublic: true,
      isReadOnly: false,
      hasPassword: false,
      views: 0,
      shareUrl: `${window.location.origin}/view/${id}`,
      tags: [],
      version: 1,
      encryptionEnabled: false
    };

    // 2. Create the History Entry (Metadata for the dashboard)
    const history: HistoryEntry = {
      id: crypto.randomUUID(),
      snippetId: id,
      title: snippet.title,
      lang: snippet.lang,
      preview: activeTab.content.substring(0, 150),
      createdAt: snippet.createdAt,
      expiresAt: snippet.expiresAt,
      fileCount: snippet.tabs.length,
      uploadCount: snippet.uploads.length,
      isPinned: false,
      shareUrl: snippet.shareUrl,
      views: 0,
      tags: []
    };

    // Save snippet to Supabase (best effort)
    try {
      await this.supabase.saveSnippet(snippet);
    } catch (e: any) {
      console.warn('Supabase snippet save failed:', e.message || e);
    }

    // Also sync history entry to Supabase if user is logged in
    const user = this.auth.user();
    if (user) {
      this.supabase.saveHistoryEntry(user.id, history).catch(e =>
        console.warn('Could not sync history to Supabase:', e)
      );
    }

    return history;
  }

  private createDefaultTab(): FileTab {
    return {
      id: crypto.randomUUID(),
      name: 'main.js',
      content: '',
      language: 'javascript',
      isActive: true
    };
  }
}

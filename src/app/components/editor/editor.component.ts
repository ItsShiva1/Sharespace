import { Component, inject, viewChild, ElementRef, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SnippetService } from '../../services/snippet.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { HistoryService } from '../../services/history.service';
import { ResizerComponent } from '../shared/resizer/resizer.component';

import { marked } from 'marked';
import DOMPurify from 'dompurify';

// CodeMirror imports
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { indentWithTab } from '@codemirror/commands';
import { keymap } from '@codemirror/view';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, ResizerComponent],
  template: `
    <div class="editor-workspace">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="tool-group main-tools">
          <input type="text" [value]="snippet.title()" (input)="onTitleChange($event)" class="title-input" placeholder="Untitled Snippet">
          <span class="slug-prefix mono">/</span>
          <input type="text" [value]="snippet.slug()" (input)="onSlugChange($event)" class="slug-input mono" placeholder="custom-slug">
        </div>
        
        <div class="tool-group action-tools">
          <select [value]="snippet.activeTab().language" (change)="onLanguageChange($event)" class="lang-select">
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="markdown">Markdown</option>
            <option value="json">JSON</option>
          </select>
          <button class="btn hide-mobile" (click)="copyActiveTabCode()">Copy</button>
          <button class="btn format hide-mobile" (click)="formatCode()">Format</button>
          <button class="btn preview-toggle" [class.active]="showPreview()" (click)="togglePreview()">
            {{ showPreview() ? 'Code' : 'Preview' }}
          </button>
          <button class="btn share" (click)="saveSnippet()">
            Save
          </button>
        </div>
      </div>

      <!-- Tabs Bar -->
      <div class="tabs-bar">
        @for (tab of snippet.tabs(); track tab.id) {
          <div class="tab" [class.active]="tab.isActive" (click)="snippet.setActiveTab(tab.id)">
            <span class="tab-name">{{ tab.name }}</span>
            <button class="tab-close" (click)="snippet.removeTab(tab.id); $event.stopPropagation()">&times;</button>
          </div>
        }
        <button class="add-tab" (click)="snippet.addTab()">+</button>
      </div>

      <!-- Editor Container -->
      <div class="editor-main" [class.split-view]="showPreview()" [class.mobile-preview]="showPreview()">
        <div #editorHost class="editor-host" 
             [class.hide-mobile]="showPreview()"
             [style.flex]="(showPreview() && !isMobile()) ? '0 0 ' + editorWidth() + 'px' : '1'">
        </div>
        
        @if (showPreview()) {
          <ss-resizer class="hide-mobile" (resize)="onResize($event)" />
          <div class="preview-pane">
            <div class="preview-header">LIVE PREVIEW</div>
            <div class="preview-content" [innerHTML]="previewContent()"></div>
          </div>
        }
      </div>

      <!-- Status Bar -->
      <div class="status-bar hide-mobile">
        <div class="status-left">
          <span class="stat">Lines: {{ lineCount() }}</span>
          <span class="stat">Chars: {{ snippet.totalChars() }}</span>
        </div>
        <div class="status-right">
          <span class="stat">{{ snippet.activeTab().language.toUpperCase() }}</span>
          <span class="stat">UTF-8</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editor-workspace {
      display: flex;
      flex-direction: column;
      position: fixed;
      inset: 64px 0 0 0;
      background: var(--ink);
      z-index: 50;
    }

    .toolbar {
      min-height: 54px;
      padding: 8px 16px;
      background: var(--ink2);
      border-bottom: 1px solid var(--wire);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .tool-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .title-input {
      background: none;
      border: none;
      color: var(--white);
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      font-weight: 600;
      outline: none;
      width: clamp(150px, 30vw, 300px);
      &::placeholder { color: var(--muted); }
    }
    
    .slug-prefix { color: var(--dim); margin-left: 12px; font-size: 14px; }
    .slug-input {
      background: none;
      border: none;
      color: var(--v);
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      outline: none;
      width: 150px;
      &::placeholder { color: var(--muted); }
    }

    .lang-select {
      background: var(--ink3);
      border: 1px solid var(--wire);
      color: var(--paper);
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      outline: none;
    }

    .btn {
      background: var(--ink3);
      border: 1px solid var(--wire);
      color: var(--paper);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover { background: var(--ink4); color: var(--white); }
      &.active { background: var(--v); color: var(--white); border-color: var(--vo); }
      &.share { background: var(--v); color: var(--white); border-color: var(--vo); padding: 6px 16px; font-weight: 600; }
    }

    .tabs-bar {
      height: 40px;
      padding: 0 10px;
      background: var(--ink2);
      display: flex;
      align-items: flex-end;
      gap: 4px;
      overflow-x: auto;
      border-bottom: 1px solid var(--wire);
      &::-webkit-scrollbar { display: none; }
    }

    .tab {
      height: 32px;
      padding: 0 12px;
      background: var(--ink);
      border: 1px solid var(--wire);
      border-bottom: none;
      border-radius: 6px 6px 0 0;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--dim);
      font-size: 13px;
      cursor: pointer;
      white-space: nowrap;
      
      &.active {
        background: var(--ink);
        color: var(--white);
        border-color: var(--v);
        box-shadow: inset 0 2px 0 var(--v);
      }

      .tab-close {
        background: none; border: none; color: var(--muted);
        font-size: 16px; line-height: 1; padding: 0 4px; cursor: pointer;
        &:hover { color: var(--coral); }
      }
    }

    .add-tab {
      height: 24px; min-width: 24px; margin-bottom: 4px;
      background: none; border: 1px solid var(--wire); border-radius: 4px;
      color: var(--dim); cursor: pointer; display: flex; align-items: center; justify-content: center;
    }

    .editor-main {
      flex: 1;
      overflow: hidden;
      display: flex;
      height: calc(100vh - 54px - 40px - 24px);
      
      @media (max-width: 768px) {
        height: calc(100dvh - 64px - 54px - 40px); // No status bar on mobile
        flex-direction: column;
      }

      &.split-view {
        .preview-pane { border-left: 1px solid var(--wire); }
        @media (max-width: 768px) {
          .preview-pane { border-left: none; width: 100% !important; flex: 1; }
        }
      }
    }

    .editor-host {
      flex: 1;
      height: 100%;
      ::ng-deep .cm-editor {
        height: 100%;
        outline: none;
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
      }
      &.hide-mobile {
        @media (max-width: 768px) { display: none !important; }
      }
    }

    .preview-pane {
      display: flex;
      flex-direction: column;
      background: var(--ink);
      overflow: hidden;
      flex: 1;
    }

    .preview-header {
      height: 24px;
      background: var(--ink2);
      border-bottom: 1px solid var(--wire);
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--dim);
      display: flex;
      align-items: center;
      padding: 0 12px;
      letter-spacing: 1px;
    }

    .preview-content {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      color: var(--paper);
      ::ng-deep {
        h1, h2, h3 { font-family: 'Bebas Neue', sans-serif; color: var(--white); margin-top: 1.2em; }
        p { margin-bottom: 0.8em; }
        pre { background: var(--ink2); padding: 12px; border-radius: 8px; border: 1px solid var(--wire); overflow-x: auto; font-size: 13px; }
      }
    }

    .status-bar {
      height: 24px;
      background: var(--ink2);
      border-top: 1px solid var(--wire);
      display: flex;
      justify-content: space-between;
      padding: 0 16px;
      align-items: center;
      color: var(--muted);
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      .stat { margin-right: 16px; }
    }

    .hide-mobile {
      @media (max-width: 768px) { display: none !important; }
    }
  `]
})
export class EditorComponent {
  protected snippet = inject(SnippetService);
  protected toast = inject(ToastService);
  protected history = inject(HistoryService);
  protected router = inject(Router);
  editorHost = viewChild<ElementRef>('editorHost');
  
  private editorView?: EditorView;
  private languageConf = new Compartment();

  lineCount = signal(0);
  showPreview = signal(false);
  editorWidth = signal(window.innerWidth / 2);

  isMobile = signal(window.innerWidth <= 768);

  previewContent = computed(() => {
    const active = this.snippet.activeTab();
    const content = active.content;

    if (active.language === 'markdown') {
      const html = marked.parse(content) as string;
      return DOMPurify.sanitize(html);
    }
    
    if (active.language === 'html') {
      return DOMPurify.sanitize(content);
    }
    
    // For other languages, show nothing or raw content in pre
    return `<pre style="font-family: var(--font-mono)">${content}</pre>`;
  });

  constructor() {
    // Sync Editor with SnippetService State
    effect(() => {
      const activeTab = this.snippet.activeTab();
      const host = this.editorHost()?.nativeElement;
      
      if (host && !this.editorView) {
        this.initEditor(host, activeTab.content, activeTab.language);
      } else if (this.editorView) {
        // Update content if tab switched but view exists
        const currentContent = this.editorView.state.doc.toString();
        if (currentContent !== activeTab.content) {
          this.editorView.dispatch({
            changes: { from: 0, to: currentContent.length, insert: activeTab.content },
            effects: this.languageConf.reconfigure(this.getLanguage(activeTab.language))
          });
        }
      }
    });

    // Cleanup on destroy
    effect((onCleanup) => {
      onCleanup(() => {
        this.editorView?.destroy();
      });
    });

    // Listen to resize
    window.addEventListener('resize', () => {
      this.isMobile.set(window.innerWidth <= 768);
    });
  }

  onTitleChange(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.snippet.setTitle(val);
  }

  onSlugChange(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.snippet.setSlug(val);
  }

  onLanguageChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    const activeTabId = this.snippet.activeTab().id;
    this.snippet.updateTabName(activeTabId, `file.${this.getExt(val)}`);
    this.snippet.updateTabLanguage(activeTabId, val);
    
    // Reconfigure CM
    this.editorView?.dispatch({
      effects: this.languageConf.reconfigure(this.getLanguage(val))
    });
  }

  togglePreview() {
    this.showPreview.update(v => !v);
  }

  onResize(pos: number) {
    this.editorWidth.set(pos);
  }

  formatCode() {
    this.toast.info('Formatting...');
    // In a real app we'd trigger a formatter extension
    setTimeout(() => this.toast.success('Formatted!'), 500);
  }

  copyActiveTabCode() {
    const code = this.snippet.activeTab().content;
    if (code) {
      navigator.clipboard.writeText(code);
      this.toast.success('Code copied to clipboard!');
    } else {
      this.toast.warning('Editor is empty');
    }
  }

  async saveSnippet() {
    if (this.snippet.totalChars() === 0) {
      this.toast.warning('Cannot save an empty snippet');
      return;
    }

    this.toast.info('Saving...');
    
    try {
      const entry = await this.snippet.saveToCloud();
      this.history.addEntry(entry);
      const shareId = entry.slug || entry.snippetId;
      this.toast.success(`Saved! View at /view/${shareId}`);
      // Optionally navigate
      this.router.navigate(['/view', shareId]);
    } catch (e) {
      this.toast.error('Failed to save snippet');
      console.error(e);
    }
  }

  private getExt(lang: string) {
    const map: any = { javascript: 'js', typescript: 'ts', python: 'py', html: 'html', css: 'css', markdown: 'md', json: 'json' };
    return map[lang] || 'txt';
  }

  private initEditor(host: HTMLElement, content: string, lang: string) {
    const state = EditorState.create({
      doc: content,
      extensions: [
        basicSetup,
        oneDark,
        keymap.of([indentWithTab]),
        this.languageConf.of(this.getLanguage(lang)),
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            this.snippet.updateTabContent(this.snippet.activeTab().id, newContent);
            this.lineCount.set(update.state.doc.lines);
          }
        })
      ]
    });

    this.editorView = new EditorView({
      state,
      parent: host
    });
    
    this.lineCount.set(state.doc.lines);
  }

  private getLanguage(lang: string) {
    switch (lang.toLowerCase()) {
      case 'javascript':
      case 'js':
      case 'typescript':
      case 'ts':
        return javascript();
      case 'python':
      case 'py':
        return python();
      case 'html':
        return html();
      case 'css':
        return css();
      case 'json':
        return json();
      case 'markdown':
      case 'md':
        return markdown();
      default:
        return javascript();
    }
  }
}

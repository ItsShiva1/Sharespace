import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../../services/confirm.service';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (confirmService.activeConfirm(); as options) {
      <div class="modal-overlay" (click)="confirmService.close(false)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3 class="display">{{ options.title }}</h3>
          <p class="message mono muted">{{ options.message }}</p>
          
          <div class="actions">
            <button class="btn" (click)="confirmService.close(false)">
              {{ options.cancelText || 'Cancel' }}
            </button>
            <button class="btn primary" (click)="confirmService.close(true)">
              {{ options.confirmText || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      animation: fadeIn 0.2s ease;
    }

    .modal-content {
      background: var(--ink2);
      border: 1px solid var(--wire);
      border-radius: var(--radius-lg, 20px);
      padding: 32px;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      animation: scaleIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);

      h3 { font-size: 24px; margin-bottom: 12px; }
      .message { font-size: 14px; margin-bottom: 32px; line-height: 1.6; }
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn {
      background: var(--ink3);
      border: 1px solid var(--wire);
      color: var(--white);
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      
      &.primary { 
        background: var(--v); 
        border-color: var(--vo); 
      }
      
      &:hover { 
        transform: translateY(-2px);
        opacity: 0.9;
      }
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class ConfirmComponent {
  confirmService = inject(ConfirmService);
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="toast.type" (click)="toastService.remove(toast.id)">
          <span class="icon"></span>
          <span class="message">{{ toast.message }}</span>
          <button class="close">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 1000;
    }

    .toast {
      min-width: 280px;
      padding: 12px 16px;
      border-radius: var(--radius-md, 12px);
      background: var(--ink3);
      border: 1px solid var(--wire);
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--white);
      box-shadow: 0 8px 16px rgba(0,0,0,0.4);
      cursor: pointer;
      animation: slideIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
      
      &.success { border-left: 4px solid var(--teal); }
      &.error { border-left: 4px solid var(--coral); }
      &.warning { border-left: 4px solid var(--amber); }
      &.info { border-left: 4px solid var(--v); }

      .message {
        flex: 1;
        font-size: 14px;
      }

      .close {
        background: none;
        border: none;
        color: var(--dim);
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        &:hover { color: var(--white); }
      }
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}

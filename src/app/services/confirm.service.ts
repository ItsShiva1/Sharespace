import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  resolve?: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private _activeConfirm = signal<ConfirmOptions | null>(null);
  activeConfirm = this._activeConfirm.asReadonly();

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this._activeConfirm.set({
        ...options,
        resolve
      });
    });
  }

  close(result: boolean) {
    const current = this._activeConfirm();
    if (current?.resolve) {
      current.resolve(result);
    }
    this._activeConfirm.set(null);
  }
}

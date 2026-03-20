import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { UploadedFile } from '../models/snippet.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private supabase = inject(SupabaseService);
  private toast = inject(ToastService);

  async uploadFile(file: File): Promise<UploadedFile> {
    const id = crypto.randomUUID();
    const path = `${id}_${file.name}`;

    try {
      this.toast.info(`Uploading ${file.name}...`);
      const url = await this.supabase.uploadFile(file, path);

      this.toast.success(`${file.name} uploaded to cloud!`);
      return {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        url,
        uploadedAt: new Date()
      };
    } catch (e: any) {
      // Fallback to local blob URL if Supabase storage not configured yet
      console.warn('Supabase Storage unavailable, using local preview:', e.message);
      this.toast.warning(`${file.name} saved locally (configure Supabase Storage for cloud)`);
      return {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date()
      };
    }
  }
}

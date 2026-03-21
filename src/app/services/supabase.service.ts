import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';
import { HistoryEntry } from '../models/snippet.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  // --- Snippets ---

  async saveSnippet(entry: any): Promise<void> {
    const payload: any = {
      id: entry.id,
      title: entry.title,
      tabs: entry.tabs,
      uploads: entry.uploads,
      lang: entry.lang,
      is_public: entry.isPublic ?? true,
      share_url: entry.shareUrl,
      tags: entry.tags ?? [],
      views: entry.views ?? 0,
      created_at: entry.createdAt.toISOString(),
      expires_at: entry.expiresAt?.toISOString() ?? null
    };

    // Only add slug if present to avoid errors if column is missing
    if (entry.slug) {
      payload.slug = entry.slug;
    }

    const { error } = await supabase.from('snippets').upsert(payload);
    
    if (error) {
      // If error is about missing column, try again without slug
      if (error.message?.includes('column "slug" of relation "snippets" does not exist')) {
        console.warn('Supabase: slug column missing. Saving without slug.');
        delete payload.slug;
        const { error: error2 } = await supabase.from('snippets').upsert(payload);
        if (error2) throw error2;
      } else {
        throw error;
      }
    }
  }

  async getSnippet(id: string): Promise<any | null> {
    // 1. Try with slug logic
    let query = supabase.from('snippets').select('*');
    
    // Check if it's a UUID or custom slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUUID) {
      const { data, error } = await query.or(`id.eq.${id},slug.eq.${id}`).single();
      if (!error) return this.mapSnippet(data);
      
      // Fallback if slug search failed (maybe column missing)
      const { data: data2, error: error2 } = await supabase.from('snippets').select('*').eq('id', id).single();
      if (!error2) return this.mapSnippet(data2);
    } else {
      // It's a slug
      const { data, error } = await query.eq('slug', id).single();
      if (!error) return this.mapSnippet(data);
    }
    
    return null;
  }

  private mapSnippet(data: any): any {
    if (!data) return null;
    return {
      ...data,
      isPublic: data['is_public'],
      shareUrl: data['share_url'],
      createdAt: new Date(data['created_at']),
      expiresAt: data['expires_at'] ? new Date(data['expires_at']) : null
    };
  }

  // --- User History ---

  async saveHistoryEntry(userId: string, entry: HistoryEntry): Promise<void> {
    const payload: any = {
      id: entry.id,
      user_id: userId,
      snippet_id: entry.snippetId,
      title: entry.title,
      lang: entry.lang,
      preview: entry.preview,
      share_url: entry.shareUrl,
      file_count: entry.fileCount,
      upload_count: entry.uploadCount,
      is_pinned: entry.isPinned,
      views: entry.views,
      tags: entry.tags,
      created_at: entry.createdAt.toISOString(),
      expires_at: entry.expiresAt?.toISOString() ?? null
    };

    if (entry.slug) {
      payload.slug = entry.slug;
    }

    const { error } = await supabase.from('history').upsert(payload);
    
    if (error) {
      if (error.message?.includes('column "slug" of relation "history" does not exist')) {
        console.warn('Supabase: slug column missing in history. Saving without slug.');
        delete payload.slug;
        const { error: error2 } = await supabase.from('history').upsert(payload);
        if (error2) throw error2;
      } else {
        throw error;
      }
    }
  }

  async getHistoryForUser(userId: string): Promise<HistoryEntry[]> {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    if (!data) return [];

    return data.map(d => ({
      id: d['id'],
      snippetId: d['snippet_id'],
      title: d['title'],
      slug: d['slug'],
      lang: d['lang'],
      preview: d['preview'],
      shareUrl: d['share_url'],
      fileCount: d['file_count'],
      uploadCount: d['upload_count'],
      isPinned: d['is_pinned'],
      views: d['views'],
      tags: d['tags'] ?? [],
      createdAt: new Date(d['created_at']),
      expiresAt: d['expires_at'] ? new Date(d['expires_at']) : null
    }));
  }

  async getHistoryEntryById(id: string): Promise<HistoryEntry | null> {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUUID) {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .or(`id.eq.${id},snippet_id.eq.${id},slug.eq.${id}`)
        .single();
      
      if (!error) return this.mapHistory(data);
      
      // Fallback if slug search failed
      const { data: data2, error: error2 } = await supabase
        .from('history')
        .select('*')
        .or(`id.eq.${id},snippet_id.eq.${id}`)
        .single();
      
      if (!error2) return this.mapHistory(data2);
    } else {
      // It's a slug
      const { data, error } = await supabase.from('history').select('*').eq('slug', id).single();
      if (!error) return this.mapHistory(data);
    }

    return null;
  }

  private mapHistory(d: any): HistoryEntry | null {
    if (!d) return null;
    return {
      id: d['id'],
      snippetId: d['snippet_id'],
      title: d['title'],
      slug: d['slug'],
      lang: d['lang'],
      preview: d['preview'],
      shareUrl: d['share_url'],
      fileCount: d['file_count'],
      uploadCount: d['upload_count'],
      isPinned: d['is_pinned'],
      views: d['views'],
      tags: d['tags'] ?? [],
      createdAt: new Date(d['created_at']),
      expiresAt: d['expires_at'] ? new Date(d['expires_at']) : null
    };
  }

  // --- File Storage ---

  async uploadFile(file: File, path: string): Promise<string> {
    const { error } = await supabase.storage
      .from('uploads')
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from('uploads').getPublicUrl(path);
    return data.publicUrl;
  }

  async deleteHistoryEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('history')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}

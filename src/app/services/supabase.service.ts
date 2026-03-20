import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';
import { HistoryEntry } from '../models/snippet.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  // --- Snippets ---

  async saveSnippet(entry: any): Promise<void> {
    const { error } = await supabase.from('snippets').upsert({
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
    });
    if (error) throw error;
  }

  async getSnippet(id: string): Promise<any | null> {
    const { data, error } = await supabase.from('snippets').select('*').eq('id', id).single();
    if (error) {
      console.error('Error fetching snippet from Supabase:', error);
      return null;
    }
    return data ? {
      ...data,
      isPublic: data['is_public'],
      shareUrl: data['share_url'],
      createdAt: new Date(data['created_at']),
      expiresAt: data['expires_at'] ? new Date(data['expires_at']) : null
    } : null;
  }

  // --- User History ---

  async saveHistoryEntry(userId: string, entry: HistoryEntry): Promise<void> {
    const { error } = await supabase.from('history').upsert({
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
    });
    if (error) throw error;
  }

  async getHistoryForUser(userId: string): Promise<HistoryEntry[]> {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) return [];

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
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .or(`id.eq.${id},snippet_id.eq.${id}`)
      .single();

    if (error || !data) return null;

    return {
      id: data['id'],
      snippetId: data['snippet_id'],
      title: data['title'],
      slug: data['slug'],
      lang: data['lang'],
      preview: data['preview'],
      shareUrl: data['share_url'],
      fileCount: data['file_count'],
      uploadCount: data['upload_count'],
      isPinned: data['is_pinned'],
      views: data['views'],
      tags: data['tags'] ?? [],
      createdAt: new Date(data['created_at']),
      expiresAt: data['expires_at'] ? new Date(data['expires_at']) : null
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
}

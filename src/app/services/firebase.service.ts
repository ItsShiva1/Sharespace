import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, getDocs, orderBy, query, limit } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { HistoryEntry } from '../models/snippet.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private injector = inject(Injector);

  private readonly SNIPPETS_COL = 'snippets';

  // --- Firestore: Snippets ---

  async saveSnippet(entry: any): Promise<void> {
    const id = entry.snippetId || entry.id;
    const docRef = doc(this.firestore, this.SNIPPETS_COL, id);
    return setDoc(docRef, { ...entry, createdAt: entry.createdAt });
  }

  async getSnippet(id: string): Promise<any | null> {
    const docRef = doc(this.firestore, this.SNIPPETS_COL, id);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  }

  // --- Firestore: User History ---

  async saveHistoryEntry(userId: string, entry: HistoryEntry): Promise<void> {
    const docRef = doc(this.firestore, `users/${userId}/history`, entry.id);
    return setDoc(docRef, {
      ...entry,
      createdAt: entry.createdAt.toISOString(),
      expiresAt: entry.expiresAt ? entry.expiresAt.toISOString() : null
    });
  }

  async getHistoryForUser(userId: string): Promise<HistoryEntry[]> {
    const col = collection(this.firestore, `users/${userId}/history`);
    const q = query(col, orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        ...data,
        createdAt: new Date(data['createdAt']),
        expiresAt: data['expiresAt'] ? new Date(data['expiresAt']) : null
      } as HistoryEntry;
    });
  }

  // --- Storage: Files ---

  async uploadFile(file: File, path: string): Promise<string> {
    const storageRef = runInInjectionContext(this.injector, () => ref(this.storage, path));
    return runInInjectionContext(this.injector, async () => {
      const snapshot = await uploadBytes(storageRef, file);
      return getDownloadURL(snapshot.ref);
    });
  }
}

import { Injectable, signal, computed, inject, Injector, runInInjectionContext } from '@angular/core';
import { User, Tier } from '../models/snippet.model';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'ss_user';

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  private _user = signal<User | null>(null);

  user = this._user.asReadonly();
  isLoggedIn = computed(() => !!this._user());
  tier = computed(() => this._user()?.tier || 'free');
  isPrime = computed(() => this.tier() === 'prime' || this.tier() === 'team');

  constructor() {
    // Restore mock user from localStorage first
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsedUser = JSON.parse(saved);
        parsedUser.joinedAt = new Date(parsedUser.joinedAt);
        // Migrate stale avatar
        if (!parsedUser.avatar || parsedUser.avatar === 'assets/default-avatar.png') {
          parsedUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(parsedUser.name)}&background=7B5EA7&color=fff`;
        }
        this._user.set(parsedUser);
      } catch {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }

    // Listen to Firebase auth state changes (works in zoneless)
    runInInjectionContext(this.injector, () => {
      onAuthStateChanged(this.auth, (fbUser) => {
        if (fbUser) {
          this.syncUserProfile(fbUser);
        } else {
          const current = this._user();
          if (current && current.id.startsWith('mock-')) return;
          this._user.set(null);
          localStorage.removeItem(this.STORAGE_KEY);
        }
      });
    });
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(this.auth, provider);
      if (result.user) {
        await this.syncUserProfile(result.user);
      }
    } catch (err: any) {
      // Ignore COOP window.closed warning — it's harmless
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Google login error:', err);
        throw err;
      }
    }
  }

  async logout() {
    const current = this._user();
    if (current && !current.id.startsWith('mock-')) {
      await signOut(this.auth);
    }
    // Clear in-memory history
    const { HistoryService } = await import('./history.service');
    this.injector.get(HistoryService).clearHistory();
    this._user.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  async upgradeToPrime() {
    const current = this._user();
    if (current) {
      const docRef = doc(this.firestore, 'users', current.id);
      const updatedUser = { ...current, tier: 'prime' as Tier };
      await setDoc(docRef, updatedUser, { merge: true });
      this._user.set(updatedUser);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));
    }
  }

  mockLogin() {
    const mockUser: User = {
      id: 'mock-prime-user',
      name: 'Mock Prime User',
      email: 'prime@sharespace.io',
      avatar: `https://ui-avatars.com/api/?name=Mock+User&background=7B5EA7&color=fff`,
      tier: 'prime',
      joinedAt: new Date()
    };
    this._user.set(mockUser);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockUser));
  }

  private async syncUserProfile(fbUser: any) {
    // Build user from Google Auth data (always available)
    const googleUser: User = {
      id: fbUser.uid,
      name: fbUser.displayName || 'Anonymous',
      email: fbUser.email || '',
      avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'User')}&background=7B5EA7&color=fff`,
      tier: 'free',
      joinedAt: new Date()
    };

    // Try to get/create Firestore profile (may fail if rules not set)
    try {
      const docRef = doc(this.firestore, 'users', fbUser.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const firestoreUser = snap.data() as User;
        // Use Firestore data (may have upgraded tier etc.)
        this._user.set(firestoreUser);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(firestoreUser));
      } else {
        // No profile yet — create one
        await setDoc(docRef, googleUser);
        this._user.set(googleUser);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(googleUser));
      }
    } catch (err: any) {
      this._user.set(googleUser);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(googleUser));
    }

    // Sync cloud history (best effort)
    this.syncHistory();
  }

  setSlug(slug: string) {
    if (!slug) {
      if (this._user()?.isAnonymous) {
        this._user.set(null);
        localStorage.removeItem(this.STORAGE_KEY);
      }
      return;
    }

    const anonUser: User = {
      id: slug,
      name: `Guest (${slug})`,
      email: '',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(slug)}&background=7B5EA7&color=fff`,
      tier: 'guest',
      joinedAt: new Date(),
      isAnonymous: true
    };

    this._user.set(anonUser);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(anonUser));
    this.syncHistory();
  }

  private async syncHistory() {
    try {
      const { HistoryService } = await import('./history.service');
      const historySvc = this.injector.get(HistoryService);
      historySvc.setLoading(true);
      const { SupabaseService } = await import('./supabase.service');
      const supabaseSvc = this.injector.get(SupabaseService);
      const cloudEntries = await supabaseSvc.getHistoryForUser(this._user()!.id);
      historySvc.mergeEntries(cloudEntries, this._user()!.id);
    } catch (e) {
      console.warn('Could not load cloud history:', e);
      const { HistoryService } = await import('./history.service');
      this.injector.get(HistoryService).setLoading(false);
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="ss-header">
      <div class="header-left">
        <a routerLink="/" class="logo">
          <span class="logo-text">SHARE<span class="highlight">SPACE</span></span>
        </a>
        
        <nav class="main-nav hide-mobile">
          <a routerLink="/editor" routerLinkActive="active">Editor</a>
          <a routerLink="/history" routerLinkActive="active">History</a>
          @if (auth.isLoggedIn() && !auth.user()?.isAnonymous) {
            <a routerLink="/upload" routerLinkActive="active">Upload</a>
          }
        </nav>
      </div>

      <div class="header-right">
        <div class="desktop-actions hide-mobile">
          @if (!auth.isLoggedIn() || auth.user()?.isAnonymous) {
            <div class="slug-input-wrapper">
              <span class="slug-prefix">@</span>
              <input 
                type="text" 
                class="slug-input" 
                placeholder="Enter slug..." 
                [value]="auth.user()?.isAnonymous ? auth.user()?.id : ''"
                (input)="onSlugChange($event)"
              >
            </div>
          }

          @if (auth.isLoggedIn()) {
            @if (auth.isPrime()) {
              <div class="badge prime">PRIME</div>
            } @else if (!auth.user()?.isAnonymous) {
              <a routerLink="/pricing" class="badge-link">
                <div class="badge free">FREE</div>
              </a>
            }
            
            <div class="user-menu" routerLink="/profile">
              <div class="avatar" [style.background-image]="'url(' + (auth.user()?.avatar || 'assets/default-avatar.png') + ')'"></div>
              <span class="username">{{ auth.user()?.name }}</span>
              <button class="btn-logout" (click)="auth.logout(); $event.stopPropagation()">Logout</button>
            </div>
          } @else {
            <button class="btn-google" (click)="auth.loginWithGoogle()">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Sign in
            </button>
          }
        </div>

        <!-- Mobile Menu Trigger -->
        <button class="menu-trigger show-mobile" (click)="toggleMenu()" [class.active]="isMenuOpen()">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <!-- Mobile Dropdown -->
      <div class="mobile-menu" [class.open]="isMenuOpen()">
        <nav class="mobile-nav">
          @if (!auth.isLoggedIn() || auth.user()?.isAnonymous) {
            <div class="slug-input-wrapper mobile-slug">
              <span class="slug-prefix">@</span>
              <input 
                type="text" 
                class="slug-input" 
                placeholder="Enter slug..." 
                [value]="auth.user()?.isAnonymous ? auth.user()?.id : ''"
                (input)="onSlugChange($event)"
              >
            </div>
          }
          
          <a routerLink="/editor" routerLinkActive="active" (click)="closeMenu()">Editor</a>
          <a routerLink="/history" routerLinkActive="active" (click)="closeMenu()">History</a>
          <a routerLink="/profile" routerLinkActive="active" (click)="closeMenu()">Profile</a>
          @if (auth.isLoggedIn() && !auth.user()?.isAnonymous) {
            <a routerLink="/upload" routerLinkActive="active" (click)="closeMenu()">Upload</a>
            <button class="mobile-logout" (click)="auth.logout(); closeMenu()">Logout</button>
          } @else {
            <button class="btn-google full-width" (click)="auth.loginWithGoogle(); closeMenu()">
              Sign in with Google
            </button>
          }
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .ss-header {
      height: 64px;
      background-color: var(--ink2);
      border-bottom: 1px solid var(--wire);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 1000;
      position: sticky;
      top: 0;
    }

    .header-left, .header-right {
      display: flex;
      align-items: center;
      gap: 32px;
    }

    .desktop-actions {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .logo {
      text-decoration: none;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 24px;
      letter-spacing: 1px;
      color: var(--white);
      .highlight { color: var(--v); }
    }

    .main-nav {
      display: flex;
      gap: 24px;
      a {
        text-decoration: none;
        color: var(--dim);
        font-weight: 500;
        font-size: 14px;
        transition: color 0.2s;
        padding: 4px 0;
        &:hover { color: var(--paper); }
        &.active { color: var(--white); position: relative; }
        &.active::after {
          content: ''; position: absolute; bottom: -20px; left: 0; right: 0;
          height: 2px; background: var(--v); box-shadow: 0 0 8px var(--v);
        }
      }
    }

    /* Mobile Parts */
    .menu-trigger {
      display: none;
      flex-direction: column;
      gap: 6px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      z-index: 1001;
      
      span {
        display: block; width: 24px; height: 2px;
        background: var(--paper); transition: all 0.3s;
      }
      
      &.active {
        span:nth-child(1) { transform: translateY(8px) rotate(45deg); }
        span:nth-child(2) { opacity: 0; }
        span:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }
      }
    }

    .mobile-menu {
      position: fixed; top: 64px; left: 0; right: 0; bottom: 0;
      background: var(--ink); z-index: 999;
      transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 40px 24px;
      &.open { transform: translateX(0); }
    }

    .mobile-nav {
      display: flex; flex-direction: column; gap: 24px;
      a {
        font-size: 24px; font-family: 'Bebas Neue', sans-serif;
        color: var(--white); text-decoration: none; border-bottom: 1px solid var(--wire); padding-bottom: 12px;
        &.active { color: var(--v); border-color: var(--v); }
      }
    }

    .mobile-logout {
      background: none; border: 1px solid var(--coral); color: var(--coral);
      padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer;
      font-size: 16px; margin-top: 12px;
    }

    .full-width { width: 100%; justify-content: center; }

    /* Existing Desktop Styles */
    .badge {
      font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700;
      padding: 2px 8px; border-radius: 4px; border: 1px solid transparent;
      &.prime { background: rgba(123, 94, 167, 0.2); color: var(--v); border-color: var(--v); }
      &.free { background: rgba(46, 196, 164, 0.1); color: var(--teal); border-color: var(--teal); }
    }

    .user-menu {
      display: flex; align-items: center; gap: 10px; cursor: pointer;
      padding: 6px 12px; border-radius: 8px; transition: background 0.2s;
      &:hover { background: var(--ink3); }
      .avatar { width: 28px; height: 28px; border-radius: 50%; background-size: cover; }
      .username { font-size: 14px; color: var(--paper); font-weight: 500; }
    }

    .btn-logout {
      background: none; border: 1px solid var(--wire); color: var(--muted);
      padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer; margin-left: 8px;
      &:hover { color: var(--coral); border-color: var(--coral); }
    }

    .btn-google {
      display: flex; align-items: center; gap: 10px;
      background: var(--ink3); color: var(--white); border: 1px solid var(--wire);
      padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500;
      cursor: pointer; transition: all 0.2s;
      &:hover { border-color: var(--v); background: var(--ink4); }
    }

    .slug-input-wrapper {
      display: flex; align-items: center; background: var(--ink3);
      border: 1px solid var(--wire); border-radius: 8px; padding: 4px 12px; gap: 4px;
      .slug-prefix { color: var(--v); font-weight: 700; font-size: 14px; }
      .slug-input { background: none; border: none; color: var(--white); font-size: 14px; outline: none; width: 140px; }
      
      &.mobile-slug {
        width: 100%;
        padding: 12px 16px;
        margin-bottom: 8px;
        background: var(--ink2);
        .slug-input { width: 100%; font-size: 18px; }
        .slug-prefix { font-size: 18px; }
      }
    }

    /* Utilities (can also be in global CSS) */
    .hide-mobile {
      @media (max-width: 768px) { display: none !important; }
    }
    .show-mobile {
      display: none !important;
      @media (max-width: 768px) { display: flex !important; }
    }
  `]
})
export class HeaderComponent {
  auth = inject(AuthService);
  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  onSlugChange(event: any) {
    const slug = event.target.value;
    this.auth.setSlug(slug);
  }
}

import { Component, inject } from '@angular/core';
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
        
        <nav class="main-nav">
          <a routerLink="/editor" routerLinkActive="active">Editor</a>
          <a routerLink="/history" routerLinkActive="active">History</a>
          <a routerLink="/upload" routerLinkActive="active">Upload</a>
        </nav>
      </div>

      <div class="header-right">
        @if (auth.isLoggedIn()) {
          @if (auth.isPrime()) {
            <div class="badge prime">PRIME USER</div>
          } @else {
            <a routerLink="/pricing" class="badge-link">
              <div class="badge free">FREE TIER</div>
            </a>
          }
          
          <div class="user-menu" routerLink="/profile" (click)="toggleMenu()">
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
    </header>
  `,
  styles: [`
    .ss-header {
      height: var(--header-height, 64px);
      background-color: var(--ink2);
      border-bottom: 1px solid var(--wire);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 100;
    }

    .header-left, .header-right {
      display: flex;
      align-items: center;
      gap: 32px;
    }

    .logo {
      text-decoration: none;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 24px;
      letter-spacing: 1px;
      color: var(--white);
      
      .highlight {
        color: var(--v);
      }
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
        position: relative;
        padding: 4px 0;

        &:hover {
          color: var(--paper);
        }

        &.active {
          color: var(--white);
          
          &::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: 0; right: 0;
            height: 2px;
            background: var(--v);
            box-shadow: 0 0 8px var(--v);
          }
        }
      }
    }

    .badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      
      &.prime {
        background: rgba(123, 94, 167, 0.2);
        color: var(--v);
        border: 1px solid var(--v);
      }

      &.free {
        background: rgba(46, 196, 164, 0.1);
        color: var(--teal);
        border: 1px solid var(--teal);
      }
    }

    .badge-link {
      text-decoration: none;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;
      transition: background 0.2s;

      &:hover {
        background: var(--ink3);
      }

      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: var(--ink4);
        background-size: cover;
      }

                   .username {
        font-size: 14px;
        color: var(--paper);
        font-weight: 500;
      }
    }

    .btn-logout {
      background: none;
      border: 1px solid var(--wire);
      color: var(--muted);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      cursor: pointer;
      margin-left: 8px;
      &:hover { color: var(--coral); border-color: var(--coral); }
    }

    .btn-google {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #161721;
    color: #7d5fa8;
    border: 1px solid #7b5fa8;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: box-shadow 0.2s, background 0.2s;
    white-space: nowrap;
      &:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.2); background: #f8f8f8; }
    }
  `]
})
export class HeaderComponent {
  auth = inject(AuthService);

  toggleMenu() {
    // To be implemented: dropdown menu
  }
}

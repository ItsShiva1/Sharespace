import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="profile-page wrap page-container">
      @if (auth.user(); as user) {
        <div class="profile-header">
          <div class="avatar-large" [style.background-image]="'url(' + (user.avatar || 'assets/default-avatar.png') + ')'"></div>
          <div class="user-info">
            <h1 class="display">{{ user.name }}</h1>
            <p class="mono muted">{{ user.email }}</p>
            <div class="badge" [class]="user.tier">{{ user.tier.toUpperCase() }}</div>
          </div>
        </div>

        <div class="profile-grid">
          <!-- Account Details -->
          <div class="profile-card">
            <h3 class="card-title">Account Details</h3>
            <div class="detail-row">
              <span class="label">Member Since</span>
              <span class="value">{{ user.joinedAt | date:'longDate' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Account ID</span>
              <span class="value mono small">{{ user.id }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Primary Email</span>
              <span class="value">{{ user.email }}</span>
            </div>
          </div>

          <!-- Subscription/Tier -->
          <div class="profile-card premium">
            @if (auth.isPrime()) {
              <div class="prime-active">
                <h3 class="card-title">Prime Active 🚀</h3>
                <p>You have full access to Cloud Uploads, Multi-file Snippets, and Custom Slugs.</p>
                <button class="btn btn-outline" routerLink="/pricing">Manage Subscription</button>
              </div>
            } @else {
              <div class="prime-upgrade">
                <h3 class="card-title">Upgrade to Prime</h3>
                <p class="dim">Unlock the full power of ShareSpace with permanent storage and team features.</p>
                <ul class="mini-features">
                  <li>✓ Unlimited snippets</li>
                  <li>✓ 100MB Cloud Storage</li>
                  <li>✓ Custom Vanity Slugs</li>
                </ul>
                <button class="btn btn-v" routerLink="/pricing">See Prime Plans</button>
              </div>
            }
          </div>

          <!-- Quick Actions -->
          <div class="profile-card">
            <h3 class="card-title">Actions</h3>
            <div class="actions-list">
              <button class="action-item" routerLink="/history">
                <span class="icon">📜</span>
                <span>View My History</span>
              </button>
              <button class="action-item" (click)="auth.logout()">
                <span class="icon">Logout</span>
              </button>
            </div>
          </div>
        </div>
      } @else {
        <div class="login-required">
          <h2 class="display">Login Required</h2>
          <p class="dim">Please login to view your profile settings.</p>
          <button class="btn btn-v" (click)="auth.loginWithGoogle()">Login with Google</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-page { padding-top: 60px; max-width: 1000px; margin: 0 auto; }
    
    .profile-header {
      display: flex;
      align-items: center;
      gap: 32px;
      margin-bottom: 48px;
      padding: 32px;
      background: var(--ink2);
      border: 1px solid var(--wire);
      border-radius: 24px;
    }

    .avatar-large {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background-size: cover;
      background-color: var(--ink3);
      border: 4px solid var(--wire);
    }

    .user-info {
      h1 { font-size: 48px; margin-bottom: 4px; }
      p { margin-bottom: 16px; }
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      
      &.prime { background: rgba(123, 94, 167, 0.2); color: var(--v); border: 1px solid var(--v); }
      &.free { background: rgba(46, 196, 164, 0.1); color: var(--teal); border: 1px solid var(--teal); }
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .profile-card {
      background: var(--ink2);
      border: 1px solid var(--wire);
      border-radius: 20px;
      padding: 32px;
      
      &.premium {
        background: linear-gradient(135deg, var(--ink2) 0%, rgba(123, 94, 167, 0.05) 100%);
        border-color: rgba(123, 94, 167, 0.3);
      }
    }

    .card-title { font-size: 20px; margin-bottom: 24px; color: var(--white); }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid var(--wire);
      &:last-child { border: none; }
      .label { color: var(--dim); font-size: 14px; }
      .value { color: var(--paper); font-weight: 500; }
      .small { font-size: 12px; opacity: 0.6; }
    }

    .mini-features {
      list-style: none;
      margin: 16px 0 24px;
      li { font-size: 13px; color: var(--paper); margin-bottom: 8px; }
    }

    .btn {
      width: 100%;
      padding: 12px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      
      &-v { background: var(--v); color: white; &:hover { opacity: 0.9; } }
      &-outline { background: none; border: 1px solid var(--wire); color: var(--paper); &:hover { border-color: var(--paper); } }
    }

    .actions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .action-item {
      background: var(--ink3);
      border: 1px solid var(--wire);
      padding: 12px 16px;
      border-radius: 10px;
      color: var(--paper);
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: border-color 0.2s;
      &:hover { border-color: var(--v); color: var(--white); }
    }

    .login-required { text-align: center; padding: 100px 0; }
  `]
})
export class ProfileComponent {
  auth = inject(AuthService);
}

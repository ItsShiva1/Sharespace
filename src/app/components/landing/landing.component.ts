import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing-page page-container">
      <!-- Hero -->
      <section class="hero section">
        <div class="wrap">
          <h1 class="bebas">CODE. CLOUD. <span class="accent">COMMAND.</span></h1>
          <p class="hero-sub dm-sans">The world's most powerful code sharing platform for modern engineers.</p>
          <div class="cta-group">
            <a routerLink="/editor" class="btn primary">Start Coding Now</a>
            <a routerLink="/pricing" class="btn secondary">View Plans</a>
          </div>
          
          <div class="hero-preview">
            <div class="glow"></div>
            <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200" alt="Editor Preview">
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="stats-strip">
        <div class="wrap">
          <div class="stat">
            <span class="val">102+</span>
            <span class="lab">Features</span>
          </div>
          <div class="stat">
            <span class="val">4.9/5</span>
            <span class="lab">Rating</span>
          </div>
          <div class="stat">
            <span class="val">Zero</span>
            <span class="lab">Latency</span>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="features section">
        <div class="wrap">
          <h2 class="display">BUILT FOR EVERY <span class="accent">PERSONA.</span></h2>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="icon">⚡</div>
              <h3>Developers</h3>
              <p>Pyodide WASM execution, Regex tester, and Diff viewer.</p>
            </div>
            <div class="feature-card">
              <div class="icon">🎓</div>
              <h3>Students</h3>
              <p>Classroom mode, study groups, and assignment templates.</p>
            </div>
            <div class="feature-card">
              <div class="icon">🏢</div>
              <h3>Teams</h3>
              <p>Real-time collaboration, shared history, and custom domains.</p>
            </div>
            <div class="feature-card">
              <div class="icon">🏦</div>
              <h3>Enterprise</h3>
              <p>E2E Encryption, Audit logs, and Digital signatures.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="wrap">
          <div class="logo-side">
            <span class="bebas logo">SHARESPACE</span>
            <p class="muted">Ultimate Cloud Engineering Platform</p>
          </div>
          <div class="footer-links">
            <a routerLink="/pricing">Pricing</a>
            <a routerLink="/editor">Editor</a>
            <a href="#">Security</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .landing-page { background: var(--ink); }

    .section { padding: 80px 0; }

    .hero {
      text-align: center;
      padding-top: 120px;
      h1 { font-size: 80px; line-height: 0.9; margin-bottom: 24px; letter-spacing: -2px; }
      .hero-sub { font-size: 20px; color: var(--dim); margin-bottom: 40px; }
      .accent { color: var(--v); text-shadow: 0 0 20px rgba(124, 58, 237, 0.4); }
    }

    .cta-group {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-bottom: 80px;
      .btn {
        padding: 16px 32px;
        border-radius: 12px;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        &.primary { 
          background: var(--v); color: white; 
          box-shadow: 0 10px 20px rgba(124, 58, 237, 0.2);
          &:hover { transform: translateY(-4px); background: var(--vo); }
        }
        &.secondary { 
          border: 1px solid var(--wire); color: var(--paper); 
          &:hover { background: var(--ink2); }
        }
      }
    }

    .hero-preview {
      position: relative;
      max-width: 1000px;
      margin: 0 auto;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid var(--wire);
      box-shadow: 0 40px 100px rgba(0,0,0,0.5);
      img { width: 100%; display: block; filter: brightness(0.8); }
      .glow {
        position: absolute; inset: 0;
        background: radial-gradient(circle at center, rgba(124, 58, 237, 0.1), transparent);
      }
    }

    .stats-strip {
      background: var(--ink2);
      border-top: 1px solid var(--wire);
      border-bottom: 1px solid var(--wire);
      padding: 40px 0;
      .wrap { display: flex; justify-content: space-around; }
      .stat {
        text-align: center;
        .val { display: block; font-size: 32px; font-weight: 700; color: var(--paper); font-family: 'Bebas Neue', sans-serif; }
        .lab { font-size: 14px; color: var(--muted); text-transform: uppercase; letter-spacing: 2px; }
      }
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 32px;
      margin-top: 60px;
    }

    .feature-card {
      background: var(--ink2);
      border: 1px solid var(--wire);
      padding: 32px;
      border-radius: 24px;
      transition: all 0.3s;
      .icon { font-size: 32px; margin-bottom: 16px; }
      h3 { margin-bottom: 12px; font-size: 20px; }
      p { color: var(--muted); line-height: 1.6; }
      &:hover { border-color: var(--v); transform: translateY(-8px); background: var(--ink3); }
    }

    .footer {
      border-top: 1px solid var(--wire);
      padding: 60px 0;
      margin-top: 80px;
      .wrap { display: flex; justify-content: space-between; align-items: center; }
      .logo { font-size: 24px; color: var(--paper); }
      .footer-links {
        display: flex; gap: 32px;
        a { color: var(--muted); text-decoration: none; &:hover { color: var(--paper); } }
      }
    }

    @media (max-width: 768px) {
      .hero h1 { font-size: 50px; }
      .wrap { padding: 0 20px; }
    }
  `]
})
export class LandingComponent {}

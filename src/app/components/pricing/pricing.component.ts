import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="pricing-page wrap page-container">
      <div class="pricing-header">
        <h1 class="display center">CHOOSE YOUR PLAN</h1>
        <p class="mono muted center">Elevate your sharing experience with ShareSpace Prime.</p>
      </div>

      <div class="pricing-grid">
        <!-- Free Tier -->
        <div class="price-card">
          <div class="card-top">
            <h2 class="display">FREE</h2>
            <div class="price">$0<span class="period">/mo</span></div>
          </div>
          <ul class="features mono">
            <li>✓ 10 Snippets per Day</li>
            <li>✓ 48-hour Snippet Expiry</li>
            <li>✓ Basic Syntax Highlighting</li>
            <li>✓ Single File Uploads</li>
            <li>✗ No Custom Slugs</li>
          </ul>
          <button class="btn" disabled>Currently Active</button>
        </div>

        <!-- Prime Tier -->
        <div class="price-card prime">
          <div class="prime-badge">RECOMMENDED</div>
          <div class="card-top">
            <h2 class="display">PRIME</h2>
            <div class="price">$9<span class="period">/mo</span></div>
          </div>
          <ul class="features mono">
            <li>✓ Unlimited Snippets</li>
            <li>✓ Custom Expiry (Permanent)</li>
            <li>✓ Multi-file Snippets</li>
            <li>✓ Large File Uploads (100MB)</li>
            <li>✓ Custom Vanity Slugs</li>
          </ul>
          <a routerLink="/checkout/prime" class="btn primary">Upgrade to Prime</a>
        </div>
      </div>

      <div class="comparison-footer">
        <p class="mono muted center">Need an Enterprise plan? <a href="mailto:contact@sharespace.io">Contact Us</a></p>
      </div>
    </div>
  `,
  styles: [`
    .pricing-page { padding-top: 40px; }
    .center { text-align: center; }
    .pricing-header { margin-bottom: 40px; padding: 0 20px; }
    .pricing-header h1 { font-size: clamp(32px, 8vw, 64px); margin-bottom: 12px; }

    .pricing-grid {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin-bottom: 60px;
      flex-wrap: wrap;
      padding: 0 20px;
    }

    .price-card {
      background: var(--ink2);
      border: 1px solid var(--wire);
      border-radius: var(--radius-lg, 24px);
      padding: 32px;
      width: 100%;
      max-width: 360px;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: transform 0.3s;
      
      &:hover { transform: translateY(-8px); }
      
      &.prime {
        border-color: var(--v);
        background: linear-gradient(180deg, var(--ink2) 0%, rgba(123, 94, 167, 0.05) 100%);
        box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(123, 94, 167, 0.1);
      }
    }

    .prime-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--v);
      color: var(--white);
      font-size: 10px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 20px;
      letter-spacing: 1px;
    }

    .card-top { margin-bottom: 32px; border-bottom: 1px solid var(--wire); padding-bottom: 24px; }
    .card-top h2 { font-size: 32px; margin-bottom: 16px; color: var(--white); }
    .price { font-size: 48px; font-weight: 800; font-family: 'DM Sans', sans-serif; color: var(--white); }
    .period { font-size: 16px; color: var(--dim); font-weight: 400; }

    .features {
      list-style: none;
      margin-bottom: 40px;
      flex: 1;
      
      li {
        margin-bottom: 16px;
        font-size: 14px;
        color: var(--paper);
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    .btn {
      width: 100%;
      padding: 16px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      transition: all 0.2s;
      
      background: var(--ink3);
      border: 1px solid var(--wire);
      color: var(--dim);
      
      &.primary {
        background: var(--v);
        border-color: var(--vo);
        color: var(--white);
        &:hover { box-shadow: 0 0 15px var(--v); opacity: 0.9; }
      }
      
      &:disabled { cursor: default; }
    }

    .comparison-footer { margin-top: 40px; }
  `]
})
export class PricingComponent {}

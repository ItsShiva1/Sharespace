import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="checkout-page page-container">
      <div class="checkout-card">
        <div class="back-link">
          <a routerLink="/pricing">← Back to Plans</a>
        </div>
        
        <div class="checkout-header">
          <h2 class="display">Secure Checkout</h2>
          <p class="mono muted">Upgrade to {{ planName() }}</p>
        </div>

        <div class="summary-box">
          <div class="item">
            <span>ShareSpace {{ planName() }}</span>
            <span class="price">$9.99/mo</span>
          </div>
          <div class="item total">
            <span>Total due today</span>
            <span class="price">$9.99</span>
          </div>
        </div>

        <form (ngSubmit)="processPayment()" #checkoutForm="ngForm">
          <div class="form-group">
            <label>Card Information</label>
            <div class="card-input-container">
              <input type="text" 
                     placeholder="Card number" 
                     name="cardNum" 
                     [(ngModel)]="cardNum"
                     maxlength="19"
                     required>
              <div class="row">
                <input type="text" placeholder="MM / YY" name="expiry" [(ngModel)]="expiry" maxlength="5" required>
                <input type="text" placeholder="CVC" name="cvc" [(ngModel)]="cvc" maxlength="3" required>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Billing Email</label>
            <input type="email" name="email" [ngModel]="auth.user()?.email" readonly>
          </div>

          <button type="submit" [disabled]="isProcessing() || !checkoutForm.valid" class="btn-pay">
            @if (isProcessing()) {
              <span class="spinner"></span> Processing...
            } @else {
              Pay $9.99
            }
          </button>
        </form>

        <p class="safe-note">🔒 Payments processed securely via mock-Stripe. No real money will be charged.</p>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page {
      min-height: calc(100vh - var(--header-height));
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ink);
      padding: 40px 20px;
    }

    .checkout-card {
      background: var(--ink2);
      border: 1px solid var(--wire);
      border-radius: 24px;
      padding: 40px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 24px 48px rgba(0,0,0,0.4);
    }

    .back-link {
      margin-bottom: 32px;
      a { color: var(--muted); text-decoration: none; font-size: 14px; &:hover { color: var(--paper); } }
    }

    .checkout-header {
      margin-bottom: 32px;
      h2 { font-size: 32px; letter-spacing: 1px; margin-bottom: 8px; }
    }

    .summary-box {
      background: var(--ink3);
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 32px;
      border: 1px solid var(--wire);
      
      .item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        color: var(--dim);
        &.total {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--wire);
          color: var(--white);
          font-weight: 600;
          font-size: 18px;
        }
      }
    }

    .form-group {
      margin-bottom: 24px;
      label { display: block; margin-bottom: 8px; color: var(--dim); font-size: 14px; }
      input {
        width: 100%;
        background: var(--ink3);
        border: 1px solid var(--wire);
        color: var(--white);
        padding: 12px 16px;
        border-radius: 8px;
        font-family: inherit;
        &:focus { border-color: var(--v); outline: none; }
      }
    }

    .card-input-container {
      border: 1px solid var(--wire);
      border-radius: 8px;
      overflow: hidden;
      input { border: none; border-bottom: 1px solid var(--wire); border-radius: 0; &:last-child { border-bottom: none; } }
      .row { display: flex; input:first-child { border-right: 1px solid var(--wire); } }
    }

    .btn-pay {
      width: 100%;
      background: var(--v);
      color: white;
      border: none;
      padding: 16px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      margin-top: 12px;
      transition: all 0.2s;
      
      &:disabled { opacity: 0.5; cursor: not-allowed; }
      &:hover:not(:disabled) { background: var(--vo); transform: translateY(-2px); }
    }

    .safe-note {
      text-align: center;
      color: var(--muted);
      font-size: 12px;
      margin-top: 24px;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
      margin-right: 8px;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class CheckoutComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  auth = inject(AuthService);
  toast = inject(ToastService);

  planName = signal('Prime');
  isProcessing = signal(false);

  cardNum = '';
  expiry = '';
  cvc = '';

  constructor() {
    this.route.params.subscribe(params => {
      this.planName.set(params['planId'] === 'prime' ? 'Prime' : 'Team');
    });
  }

  async processPayment() {
    this.isProcessing.set(true);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 2000));

    try {
      await this.auth.upgradeToPrime();
      this.toast.success(`Successfully upgraded to ${this.planName()}!`);
      this.router.navigate(['/']);
    } catch (e) {
      this.toast.error('Payment failed. Please try again.');
    } finally {
      this.isProcessing.set(false);
    }
  }
}

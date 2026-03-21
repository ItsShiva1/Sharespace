import { Routes } from '@angular/router';
import { ViewComponent } from './components/view/view.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/landing/landing.component').then(m => m.LandingComponent),
    title: 'ShareSpace — Code. Cloud. Command.'
  },
  {
    path: 'editor',
    loadComponent: () => import('./components/editor/editor.component').then(m => m.EditorComponent),
    title: 'ShareSpace — Professional Editor'
  },
  {
    path: 'view/:id',
    component: ViewComponent,
    title: 'ShareSpace — View Snippet'
  },
  {
    path: 'history',
    loadComponent: () => import('./components/history/history.component').then(m => m.HistoryComponent),
    title: 'ShareSpace — History'
  },
  {
    path: 'history/:slug',
    loadComponent: () => import('./components/history/history.component').then(m => m.HistoryComponent),
    title: 'ShareSpace — Guest History'
  },
  {
    path: 'pricing',
    loadComponent: () => import('./components/pricing/pricing.component').then(m => m.PricingComponent),
    title: 'ShareSpace — Pricing'
  },
  {
    path: 'checkout/:planId',
    loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent),
    title: 'ShareSpace — Checkout'
  },
  {
    path: 'upload',
    loadComponent: () => import('./components/uploader/uploader.component').then(m => m.UploaderComponent),
    title: 'ShareSpace — Upload'
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    title: 'ShareSpace — My Profile'
  },
  {
    path: '**',
    redirectTo: ''
  }
];

import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login/login').then(c => c.Login) },
  { path: 'signup', loadComponent: () => import('./auth/signup/signup').then(c => c.Signup) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(c => c.Dashboard) },
  { path: 'focus-mode', loadComponent: () => import('./focus-mode/focus-mode').then(c => c.FocusMode) },
  { path: '**', redirectTo: 'dashboard' }
];

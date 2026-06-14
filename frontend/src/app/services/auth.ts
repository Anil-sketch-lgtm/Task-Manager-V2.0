import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiBaseUrl}/auth`;

  isAuthenticated = signal<boolean>(!!localStorage.getItem('token'));
  currentUser = signal<any>(null);

  constructor() {
    if (this.isAuthenticated()) {
      this.loadProfile();
    }
  }

  loadProfile() {
    this.getProfile().subscribe({
      next: user => this.currentUser.set(user),
      error: err => {
        console.error('Failed to load profile', err);
        if (err.status === 401 || err.status === 403) {
          this.logout();
        }
      }
    });
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          this.isAuthenticated.set(true);
          this.loadProfile();
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout() {
    localStorage.removeItem('token');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, profileData);
  }
}

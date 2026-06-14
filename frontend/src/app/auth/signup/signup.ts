import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html'
})
export class Signup {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);

  signupForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  errorMsg = signal<string>('');
  successMsg = signal<string>('');

  onSubmit() {
    if (this.signupForm.valid) {
      this.authService.signup(this.signupForm.value).subscribe({
        next: () => {
          this.successMsg.set('Account created successfully! Redirecting...');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          console.error('Signup error:', err);
          this.errorMsg.set(err.error?.error || 'Signup failed');
        }
      });
    }
  }
}

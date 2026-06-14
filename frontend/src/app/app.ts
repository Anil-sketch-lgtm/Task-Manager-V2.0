import { Component, signal, inject, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  authService = inject(Auth);
  private fb = inject(FormBuilder);

  isDropdownOpen = signal<boolean>(false);
  isProfileModalOpen = signal<boolean>(false);
  isPasswordModalOpen = signal<boolean>(false);

  profileErrorMsg = signal<string>('');
  profileSuccessMsg = signal<string>('');
  passwordErrorMsg = signal<string>('');
  passwordSuccessMsg = signal<string>('');

  profileForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  changePasswordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, {
    validators: (group: any) => {
      const newPwd = group.get('newPassword')?.value;
      const confirmPwd = group.get('confirmPassword')?.value;
      return newPwd === confirmPwd ? null : { mismatch: true };
    }
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const path = event.composedPath();
    const clickedInside = path.some(el => el instanceof HTMLElement && el.classList.contains('profile-container'));
    if (!clickedInside) {
      this.isDropdownOpen.set(false);
    }
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen.update(v => !v);
  }

  getInitials(): string {
    const user = this.authService.currentUser();
    if (!user || !user.name) return '?';
    return user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  }

  openEditProfileModal() {
    this.isDropdownOpen.set(false);
    this.profileErrorMsg.set('');
    this.profileSuccessMsg.set('');

    const fillForm = (user: any) => {
      if (user) {
        this.profileForm.patchValue({
          name: user.name || '',
          email: user.email || ''
        });
      }
    };

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.authService.currentUser.set(user);
          fillForm(user);
        },
        error: (err) => {
          console.error(err);
          this.profileErrorMsg.set('Failed to load profile data');
        }
      });
    } else {
      fillForm(currentUser);
    }

    this.isProfileModalOpen.set(true);
  }

  closeEditProfileModal() {
    this.isProfileModalOpen.set(false);
    this.profileForm.reset();
  }

  onUpdateProfile() {
    if (this.profileForm.valid) {
      this.profileErrorMsg.set('');
      this.profileSuccessMsg.set('');
      const formValue = this.profileForm.value;
      
      const updateData = {
        name: formValue.name!,
        email: formValue.email!
      };

      this.authService.updateProfile(updateData).subscribe({
        next: (res: any) => {
          this.profileSuccessMsg.set(res.message || 'Profile updated successfully!');
          this.authService.currentUser.set(res.user);
          setTimeout(() => {
            this.closeEditProfileModal();
          }, 1500);
        },
        error: (err: any) => {
          console.error(err);
          this.profileErrorMsg.set(err.error?.error || 'Failed to update profile');
        }
      });
    }
  }

  openChangePasswordModal() {
    this.isDropdownOpen.set(false);
    this.changePasswordForm.reset();
    this.passwordErrorMsg.set('');
    this.passwordSuccessMsg.set('');
    this.isPasswordModalOpen.set(true);
  }

  closeChangePasswordModal() {
    this.isPasswordModalOpen.set(false);
    this.changePasswordForm.reset();
  }

  onChangePassword() {
    if (this.changePasswordForm.valid) {
      this.passwordErrorMsg.set('');
      this.passwordSuccessMsg.set('');
      const formValue = this.changePasswordForm.value;

      this.authService.updateProfile({
        currentPassword: formValue.currentPassword!,
        password: formValue.newPassword!
      }).subscribe({
        next: (res: any) => {
          this.passwordSuccessMsg.set('Password changed successfully!');
          setTimeout(() => {
            this.closeChangePasswordModal();
          }, 1500);
        },
        error: (err: any) => {
          console.error(err);
          this.passwordErrorMsg.set(err.error?.error || 'Failed to change password');
        }
      });
    }
  }

  logout() {
    this.isDropdownOpen.set(false);
    this.authService.logout();
  }
}

// src/app/pages/login/login.page.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, Platform } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class LoginPage {
  email = '';
  password = '';
  error = '';
  isIOS: boolean;

  constructor(
    private router: Router,
    private auth: AuthService,
    private platform: Platform
  ) {
    this.isIOS = this.platform.is('ios');
  }

  async onLogin(e?: Event) {
    e?.preventDefault();
    this.error = '';
    try {
      await this.auth.login({ email: this.email, password: this.password });
      // change 'loading' to your post-login route if different
      this.router.navigate(['loading'], { replaceUrl: true });
    } catch (err: any) {
      this.error = err?.message ?? 'Login failed';
      console.error('Login failed:', err);
    }
  }

  async onCreate(e?: Event) {
    e?.preventDefault();
    this.error = '';
    try {
      await this.auth.register({ email: this.email, password: this.password });
      this.router.navigate(['loading'], { replaceUrl: true });
    } catch (err: any) {
      this.error = err?.message ?? 'Registration failed';
      console.error('Registration failed:', err);
    }
  }

  toggleMode() {
    // optional: swap UI between login and register screens
    console.log('Toggle between login and registration modes');
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;

  constructor() {
    // Check localStorage for persisted authentication status
    const storedAuth = localStorage.getItem('isAuthenticated');
    this.isAuthenticated = storedAuth === 'true';
  }

// auth.service.ts  (replace both methods)
async login({ email, password }: { email: string; password: string }) {
  if (email && password.length >= 6) {
    this.isAuthenticated = true;
    localStorage.setItem('isAuthenticated', 'true');
  } else {
    throw new Error('Invalid email or password');
  }
}

async register({ email, password }: { email: string; password: string }) {
  if (email && password.length >= 6) {
    this.isAuthenticated = true;
    localStorage.setItem('isAuthenticated', 'true');
  } else {
    throw new Error('Invalid registration details');
  }
}


  async logout(): Promise<void> {
    // Simulate a logout process
    this.isAuthenticated = false;
    localStorage.removeItem('isAuthenticated'); // Clear persisted authentication status
  }

  async isLoggedIn(): Promise<boolean> {
    // Simulate checking authentication status
    return this.isAuthenticated;
  }
}
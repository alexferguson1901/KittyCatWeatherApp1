// src/app/pages/loading/loading.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.page.html',
  styleUrls: ['./loading.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class LoadingPage implements OnInit {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      // Simulate data loading or do your real bootstrapping here
      await this.simulateLoading();

      // Go to home after loading
      this.router.navigate(['home'], { replaceUrl: true });
    } catch (error) {
      console.error('Error during loading', error);
      this.router.navigate(['login'], { replaceUrl: true });
    }
  }

  private async simulateLoading(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1500));
  }
}

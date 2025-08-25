import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-launching',
  templateUrl: './launching.page.html',
  styleUrls: ['./launching.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class LaunchingPage implements OnInit {
  constructor(private router: Router, private authService: AuthService) {}

  async ngOnInit() {
    // Simulate launching delay
    await this.simulateLaunching();

    // Check if the user is logged in
    const isAuthenticated = await this.authService.isLoggedIn();

    // Navigate to the appropriate page
    if (isAuthenticated) {
      this.router.navigate(['home'], { replaceUrl: true });
    } else {
      this.router.navigate(['login'], { replaceUrl: true });
    }
  }

  private async simulateLaunching(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 3000)); // Simulate 3 seconds of launching
  }
}
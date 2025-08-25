import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { CalendarSetupModalComponent } from '../../components/calendar-setup-modal/calendar-setup-modal.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class SettingsPage {
  user: any = {
    name: 'User Name',
    // IMPORTANT: use the right filename + casing that actually exists in /assets/images
    // (your project has Avatar.png, not Avatar.PNG)
    avatar: 'assets/images/Avatar.png',
  };

  settings = {
    appLock: false,
    notifications: true,
    reminders: true,
  };

  constructor(
    public auth: AuthService,
    private router: Router,
    private modalCtrl: ModalController,
    private navCtrl: NavController
  ) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async openCycleSetupModal() {
    const modal = await this.modalCtrl.create({
      component: CalendarSetupModalComponent,
      cssClass: 'setup-modal',
    });
    await modal.present();
  }

  // If the avatar path is wrong/missing, fall back to a safe image
  onAvatarError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    img.src = 'assets/images/Fallback.png'; // this exists in your project
  }

  async logout() {
    try {
      await this.auth.logout();
    } catch (e) {
      console.warn('Logout error (continuing):', e);
    } finally {
      try {
        const top = await this.modalCtrl.getTop();
        if (top) await top.dismiss();
      } catch {}
      this.navCtrl.navigateRoot('/login'); // reset stack to /login
    }
  }
}

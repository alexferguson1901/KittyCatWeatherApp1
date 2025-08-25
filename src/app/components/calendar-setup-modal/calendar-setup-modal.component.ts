// src/app/components/calendar-setup-modal/calendar-setup-modal.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

type PlannerEntry = { date: string; note: string; savedAt: string };

@Component({
  selector: 'app-calendar-setup-modal',
  standalone: true,
  templateUrl: './calendar-setup-modal.component.html',
  styleUrls: ['./calendar-setup-modal.component.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class CalendarSetupModalComponent {
  /** Optional: keep today as ISO if you need it elsewhere */
  todayISO: string = new Date().toISOString().split('T')[0];

  /** Allow selecting up to 3 years in the future */
  futureMaxISO: string = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 3);
    // set midday to avoid timezone <-> UTC off-by-one
    d.setHours(12, 0, 0, 0);
    return d.toISOString().split('T')[0];
  })();

  /** Selected date (YYYY-MM-DD) */
  selectedDate: string | null = null;

  /** Planner note for that date */
  note: string = '';

  private STORAGE_KEY = 'planner_entries';

  constructor(private modalCtrl: ModalController) {}

  ionViewWillEnter() {
    if (this.selectedDate === undefined) this.selectedDate = null;
    if (this.note === undefined || this.note === null) this.note = '';
  }

  onDateChange(ev: CustomEvent) {
    const value = (ev.detail as any)?.value;
    if (typeof value === 'string') {
      this.selectedDate = value.includes('T') ? value.split('T')[0] : value;
    } else if (value instanceof Date) {
      this.selectedDate = value.toISOString().split('T')[0];
    } else {
      this.selectedDate = null;
    }
  }

  async save() {
    try {
      if (!this.selectedDate) {
        const alert = document.createElement('ion-alert');
        alert.header = 'Date required';
        alert.message = 'Please choose a date first.';
        alert.buttons = ['OK'];
        document.body.appendChild(alert);
        await alert.present();
        return;
      }

      const entry: PlannerEntry = {
        date: this.selectedDate,
        note: this.note?.trim() ?? '',
        savedAt: new Date().toISOString(),
      };

      const raw = localStorage.getItem(this.STORAGE_KEY);
      const list: PlannerEntry[] = raw ? JSON.parse(raw) : [];

      const idx = list.findIndex(e => e.date === entry.date);
      if (idx >= 0) list[idx] = entry; else list.unshift(entry);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      await this.modalCtrl.dismiss(true);
    } catch (err) {
      console.error('Failed to save plan:', err);
      const alert = document.createElement('ion-alert');
      alert.header = 'Error';
      alert.message = 'There was a problem saving your plan. Please try again.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    }
  }

  cancel() {
    this.modalCtrl.dismiss(false);
  }
}

// src/app/components/calendar-view-modal/calendar-view-modal.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

type PlannerEntry = { date: string; note: string; savedAt: string };

@Component({
  selector: 'app-calendar-view-modal',
  standalone: true,
  templateUrl: './calendar-view-modal.component.html',
  styleUrls: ['./calendar-view-modal.component.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class CalendarViewModalComponent implements OnInit {
  private STORAGE_KEY = 'planner_entries';

  // Range: from start of current month to end of month 36 months ahead
  today = new Date();
  minMonth = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
  maxMonth = new Date(this.today.getFullYear(), this.today.getMonth() + 36, 1);

  // Current month being displayed
  viewYear = this.today.getFullYear();
  viewMonth = this.today.getMonth(); // 0..11

  // Selected date (YYYY-MM-DD) and note for that day
  selectedDate: string | null = null;
  selectedNote: string = '';

  // All entries indexed by date
  entriesMap = new Map<string, PlannerEntry>();

  // Calendar grid cells
  monthCells: Array<{
    y: number; m: number; d: number;
    inMonth: boolean;
    iso: string;
    hasEvent: boolean;
    isToday: boolean;
    isSelected: boolean;
  }> = [];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.loadEntries();
    this.buildMonth(this.viewYear, this.viewMonth);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  // ---------- Data ----------
  private loadEntries() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    const list: PlannerEntry[] = raw ? JSON.parse(raw) : [];
    this.entriesMap.clear();
    for (const e of list) this.entriesMap.set(e.date, e);
  }

  private saveEntries() {
    const list = Array.from(this.entriesMap.values())
      .sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  // ---------- Calendar generation ----------
  private buildMonth(year: number, month: number) {
    this.viewYear = year;
    this.viewMonth = month;

    const first = new Date(year, month, 1);
    const startDay = first.getDay(); // 0..6
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // We’ll show a 6-row grid (42 cells). Fill leading from previous month, trailing from next.
    const cells: typeof this.monthCells = [];

    const prevMonth = new Date(year, month, 0);
    const daysInPrev = prevMonth.getDate();

    // Leading
    for (let i = 0; i < startDay; i++) {
      const d = daysInPrev - startDay + 1 + i;
      const y = prevMonth.getFullYear();
      const m = prevMonth.getMonth();
      const iso = this.iso(y, m, d);
      cells.push({
        y, m, d, iso,
        inMonth: false,
        hasEvent: this.entriesMap.has(iso),
        isToday: this.isTodayISO(iso),
        isSelected: this.selectedDate === iso,
      });
    }

    // In-month
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = this.iso(year, month, d);
      cells.push({
        y: year, m: month, d, iso,
        inMonth: true,
        hasEvent: this.entriesMap.has(iso),
        isToday: this.isTodayISO(iso),
        isSelected: this.selectedDate === iso,
      });
    }

    // Trailing
    let tail = 42 - cells.length;
    const next = new Date(year, month + 1, 1);
    for (let d = 1; d <= tail; d++) {
      const y = next.getFullYear();
      const m = next.getMonth();
      const iso = this.iso(y, m, d);
      cells.push({
        y, m, d, iso,
        inMonth: false,
        hasEvent: this.entriesMap.has(iso),
        isToday: this.isTodayISO(iso),
        isSelected: this.selectedDate === iso,
      });
    }

    this.monthCells = cells;
  }

  // ---------- Navigation ----------
  canPrev(): boolean {
    const current = new Date(this.viewYear, this.viewMonth, 1);
    return current > this.minMonth;
  }

  canNext(): boolean {
    const current = new Date(this.viewYear, this.viewMonth, 1);
    // We allow up to 3 years ahead inclusive
    return current < this.maxMonth;
  }

  prevMonth() {
    if (!this.canPrev()) return;
    const d = new Date(this.viewYear, this.viewMonth - 1, 1);
    this.buildMonth(d.getFullYear(), d.getMonth());
  }

  nextMonth() {
    if (!this.canNext()) return;
    const d = new Date(this.viewYear, this.viewMonth + 1, 1);
    this.buildMonth(d.getFullYear(), d.getMonth());
  }

  // ---------- Selection ----------
  selectCell(cell: (typeof this.monthCells)[number]) {
    this.selectedDate = cell.iso;
    this.selectedNote = this.entriesMap.get(cell.iso)?.note ?? '';
    // refresh selected highlight
    this.monthCells = this.monthCells.map(c => ({ ...c, isSelected: c.iso === cell.iso }));
  }

  deleteSelected() {
    if (!this.selectedDate) return;
    this.entriesMap.delete(this.selectedDate);
    this.saveEntries();
    this.selectedNote = '';
    // Rebuild month to update markers
    this.buildMonth(this.viewYear, this.viewMonth);
  }

  // ---------- Helpers ----------
  monthLabel(): string {
    return new Date(this.viewYear, this.viewMonth, 1).toLocaleString([], {
      month: 'long', year: 'numeric'
    });
  }

  private iso(y: number, m: number, d: number): string {
    const mm = (m + 1).toString().padStart(2, '0');
    const dd = d.toString().padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  }

  private isTodayISO(iso: string): boolean {
    const t = new Date();
    const todayIso = this.iso(t.getFullYear(), t.getMonth(), t.getDate());
    return iso === todayIso;
  }
}

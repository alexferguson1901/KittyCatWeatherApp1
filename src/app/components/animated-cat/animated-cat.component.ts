import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-animated-cat',
  templateUrl: './animated-cat.component.html',
  styleUrls: ['./animated-cat.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class AnimatedCatComponent implements OnChanges {
  @Input() weatherCondition: string | null = null;

  // Exact filenames in src/assets/images/
  private readonly img = {
    avatar:  'assets/images/Avatar.png',
    cloudy:  'assets/images/Cloudy.png',
    sunny:   'assets/images/Sunny.png',
    rainy:   'assets/images/Rainy.png',
    thunder: 'assets/images/Thunderstorm.png',
    snow:    'assets/images/Snowy.png',
  };

  catImage = this.img.avatar;

  ngOnChanges(): void {
    this.updateCatByWeather();
  }

  private updateCatByWeather(): void {
    const w = (this.weatherCondition ?? '').toLowerCase().trim();

    // Try exact keys first, then contains() fallback
    const map: Record<string, string> = {
      clouds:       this.img.cloudy,
      cloud:        this.img.cloudy,
      clear:        this.img.sunny,
      sun:          this.img.sunny,
      rain:         this.img.rainy,
      drizzle:      this.img.rainy,
      thunderstorm: this.img.thunder,
      thunder:      this.img.thunder,
      snow:         this.img.snow,
    };

    // exact
    if (map[w]) {
      this.catImage = map[w];
      return;
    }

    // contains/fuzzy
    const found = Object.keys(map).find(k => w.includes(k));
    this.catImage = found ? map[found] : this.img.avatar;
  }

  // Friendly fallback if the chosen file 404s
  onImgError() {
    this.catImage = this.img.avatar;
  }

  // Keep old misspelled calls (if used elsewhere) functioning
  public updateCatkByWeather(): void {
    this.updateCatByWeather();
  }
}

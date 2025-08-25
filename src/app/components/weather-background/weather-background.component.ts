import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-weather-background',
  templateUrl: './weather-background.component.html',
  styleUrls: ['./weather-background.component.scss'],
  imports: [CommonModule],
  standalone: true,
})
export class WeatherBackgroundComponent implements OnChanges {
  @Input() weatherCode!: number; // Weather condition code from the API
  backgroundImage: string = 'default-background'; // Default background

  constructor(private weatherService: WeatherService) {}

  ngOnChanges() {
    if (this.weatherCode !== undefined) {
      this.backgroundImage = this.weatherService.getWeatherBackground(this.weatherCode);
    }
  }
}
// src/app/pages/home/home.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

import { WeatherService } from '../../services/weather.service';
import { LocationService } from '../../services/location.service';

import { AnimatedCatComponent } from '../../components/animated-cat/animated-cat.component';
import { WeatherBackgroundComponent } from '../../components/weather-background/weather-background.component';
import { DetailedForecastComponent } from '../../components/detailed-forecast/detailed-forecast.component';
import { SettingsPage } from '../settings/settings.page';
import { CalendarViewModalComponent } from '../../components/calendar-view-modal/calendar-view-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, AnimatedCatComponent, WeatherBackgroundComponent],
})
export class HomePage implements OnInit {
  currentWeather: any;
  hourlyForecast: any[] = [];
  location = 'Loading...';
  currentTime = '';
  isPanelExpanded = false;

  constructor(
    private weatherService: WeatherService,
    private locationService: LocationService,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    this.updateTime();
    setInterval(() => this.updateTime(), 60_000);

    try {
      const position = await this.locationService.getCurrentLocation();
      const { latitude, longitude } = position.coords;

      // Reverse geocode
      this.location = await this.locationService.getLocationName(latitude, longitude);
      if (!this.location || /unknown/i.test(this.location)) {
        this.location = 'Blackrock, Ireland';
      }

      // Weather + forecast
      this.currentWeather = await this.weatherService.getCurrentWeather(latitude, longitude);
      const forecastData = await this.weatherService.getHourlyForecast(latitude, longitude);
      this.hourlyForecast = this.processHourlyForecast(forecastData);
    } catch (error: any) {
      console.error('Error loading weather data:', error?.message);

      if (error?.message === 'User denied Geolocation') {
        // Hard fallback: Blackrock
        this.location = 'Blackrock, Ireland';
        await this.loadDefaultWeather();
      } else {
        this.location = 'Error retrieving location';
      }
    }
  }

  private async loadDefaultWeather() {
    try {
      // Blackrock, IE approx
      const defaultLatitude = 53.3;
      const defaultLongitude = -6.18;

      this.currentWeather = await this.weatherService.getCurrentWeather(defaultLatitude, defaultLongitude);
      const forecastData = await this.weatherService.getHourlyForecast(defaultLatitude, defaultLongitude);
      this.hourlyForecast = this.processHourlyForecast(forecastData);

      if (!this.location || /unknown/i.test(this.location)) {
        this.location = 'Blackrock, Ireland';
      }
    } catch (error: any) {
      console.error('Error loading default weather data:', error?.message);
    }
  }

  private updateTime() {
    this.currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Show consecutive next 12 hours by snapping to nearest forecast entry
  private processHourlyForecast(forecastData: any): any[] {
    const hourly: any[] = forecastData?.hourly ?? [];
    const list3h: any[] = forecastData?.list ?? [];

    const normalized: Array<{ t: number; temp: number; icon: string }> =
      hourly.length > 0
        ? hourly.map(h => ({ t: h.dt * 1000, temp: h.temp, icon: h.weather?.[0]?.icon }))
        : list3h.map(l => ({ t: l.dt * 1000, temp: l.main?.temp, icon: l.weather?.[0]?.icon }));

    if (normalized.length === 0) return [];

    const now = Date.now();
    const out: any[] = [];

    for (let i = 0; i < 12; i++) {
      const target = now + i * 60 * 60 * 1000;
      let nearest = normalized[0];
      let best = Math.abs(nearest.t - target);

      for (let j = 1; j < normalized.length; j++) {
        const d = Math.abs(normalized[j].t - target);
        if (d < best) {
          best = d;
          nearest = normalized[j];
        }
      }

      out.push({
        time: new Date(target).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        icon: this.mapWeatherIcon(nearest.icon),
        temp: Math.round(nearest.temp),
      });
    }
    return out;
  }

  private mapWeatherIcon(iconCode: string): string {
    const iconMap: Record<string, string> = {
      '01d': 'sunny',
      '01n': 'moon',
      '02d': 'partly-sunny',
      '02n': 'cloudy-night',
      '03d': 'cloudy',
      '03n': 'cloudy',
      '04d': 'cloudy',
      '04n': 'cloudy',
      '09d': 'rainy',
      '09n': 'rainy',
      '10d': 'rainy',
      '10n': 'rainy',
      '11d': 'thunderstorm',
      '11n': 'thunderstorm',
      '13d': 'snow',
      '13n': 'snow',
      '50d': 'cloudy',
      '50n': 'cloudy',
    };
    return iconMap[iconCode] || 'help-circle';
  }

  togglePanel() {
    this.isPanelExpanded = !this.isPanelExpanded;
  }

  async openSettings() {
    const modal = await this.modalCtrl.create({ component: SettingsPage });
    await modal.present();
  }

  async openDetailedForecast() {
    try {
      const position = await this.locationService.getCurrentLocation();
      const { latitude, longitude } = position.coords;

      const currentWeather = await this.weatherService.getCurrentWeather(latitude, longitude);
      const hourlyForecastData = await this.weatherService.getHourlyForecast(latitude, longitude);
      const hourlyForecast = this.processHourlyForecast(hourlyForecastData);
      const dailyForecast = await this.weatherService.getDailyForecast(latitude, longitude);

      const weatherData = { current: currentWeather, hourly: hourlyForecast, daily: dailyForecast };
      const apiKey = this.weatherService.getApiKey();

      const modal = await this.modalCtrl.create({
        component: DetailedForecastComponent,
        componentProps: {
          weatherData,
          location: this.location,
          currentCoords: { lat: latitude, lon: longitude },
          apiKey,
        },
      });
      await modal.present();
    } catch (error) {
      console.error('Error opening detailed forecast:', error);
      const alert = document.createElement('ion-alert');
      alert.header = 'Error';
      alert.message = 'Unable to load detailed forecast. Please try again later.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    }
  }

  // Open the planner calendar ( button)
  async openPlannerCalendar() {
    const modal = await this.modalCtrl.create({
      component: CalendarViewModalComponent,
      cssClass: 'setup-modal',
    });
    await modal.present();
  }
}

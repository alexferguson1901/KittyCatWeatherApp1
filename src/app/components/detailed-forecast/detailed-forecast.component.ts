import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController, IonicModule, GestureController } from '@ionic/angular';
import { WeatherConditionsComponent } from '../weather-conditions/weather-conditions.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Add this import
import * as L from 'leaflet';



@Component({
  selector: 'app-detailed-forecast',
  templateUrl: './detailed-forecast.component.html',
  styleUrls: ['./detailed-forecast.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule], // Add FormsModule here
})
export class DetailedForecastComponent implements OnInit {
  @Input() weatherData: any; // Full weather data passed from the parent
  @Input() location!: string; // Location name passed from the parent
  @Input() apiKey!: string;
  @Input() currentCoords!: { lat: number, lon: number }; // Passed from parent
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  hourlyForecast: any[] = []; // Processed hourly forecast data
  dailyForecast: any[] = []; // Processed daily forecast data
  activeMapLayer = 'PR0'; // Default map layer
  mapLayers = [
    { id: 'PR0', name: 'Precipitation Intensity', icon: 'water' },
    { id: 'PA0', name: 'Accumulated Precipitation', icon: 'rainy' },
    { id: 'WND', name: 'Wind Speed & Direction', icon: 'flag' },
    { id: 'TA2', name: 'Air Temperature', icon: 'thermometer' },
    { id: 'CL', name: 'Cloud Cover', icon: 'cloudy' }
  ];

  mapZoom = 6;
  showMap = false;
  isMapFullscreen = false;

  private leafletMap!: L.Map;
  private marker!: L.Marker;

  constructor(
    private modalCtrl: ModalController,
    private gestureCtrl: GestureController
  ) { }

  ngOnInit() {
    console.log('Current Coordinates:', this.currentCoords);
    if (this.weatherData) {
      this.weatherData.current.main.temp = Math.round(this.weatherData.current.main.temp); this.hourlyForecast = this.weatherData.hourly;
      this.dailyForecast = this.weatherData.daily;
    } else {
      console.error('Weather data is missing.');
    }
  }

  // Initialize Leaflet Map
  initLeafletMap() {
    if (this.leafletMap) return; // Prevent re-initialization

    this.leafletMap = L.map(this.mapContainer.nativeElement).setView(
      [this.currentCoords.lat, this.currentCoords.lon],
      this.mapZoom
    );

    L.tileLayer(`https://maps.openweathermap.org/maps/2.0/weather/${this.activeMapLayer}/{z}/{x}/{y}?appid=${this.apiKey}`, {
      opacity: 0.8,
      attribution: '&copy; <a href="https://openweathermap.org">OpenWeather</a>',
    }).addTo(this.leafletMap);

    this.marker = L.marker([this.currentCoords.lat, this.currentCoords.lon], {
      icon: L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
    }).addTo(this.leafletMap);
  }

  // Extract and process hourly and daily forecasts
  extractForecasts() {
    if (this.weatherData) {
      // Process hourly forecast
      this.hourlyForecast = this.weatherData.hourly.map((hour: any) => ({
        time: new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        icon: this.mapWeatherIcon(hour.weather[0].icon),
        temp: Math.round(hour.temp),
      }));

      // Process daily forecast
      this.dailyForecast = this.weatherData.daily.map((day: any) => ({
        date: new Date(day.dt * 1000).toLocaleDateString([], { weekday: 'long' }),
        icon: this.mapWeatherIcon(day.weather[0].icon),
        tempMin: Math.round(day.temp.min),
        tempMax: Math.round(day.temp.max),
        condition: day.weather[0].description,
      }));
    }
  }

  // Map OpenWeatherMap icon codes to Ionicons or custom icons
  mapWeatherIcon(iconCode: string): string {
    const iconMap: { [key: string]: string } = {
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
    return iconMap[iconCode] || 'help-circle'; // Default icon
  }

  // Open a modal for detailed weather conditions
  async openWeatherConditions() {
    const modal = await this.modalCtrl.create({
      component: WeatherConditionsComponent,
      componentProps: {
        weatherData: this.weatherData,
      },
    });
    await modal.present();
  }

  // New map-related functions
  toggleMapView() {
    this.showMap = !this.showMap;
  if (this.showMap) {
    setTimeout(() => this.initLeafletMap(), 100);
  }
  }

  toggleMapFullscreen() {
    this.isMapFullscreen = !this.isMapFullscreen;
  }

  // Change Map Layer
  changeMapLayer(layer: string | undefined) {
    if (!layer || !this.leafletMap) return;
    this.activeMapLayer = layer;

    // Remove existing tile layers
    this.leafletMap.eachLayer((layerObj) => {
      if (layerObj instanceof L.TileLayer) this.leafletMap.removeLayer(layerObj);
    });

    // Add new tile layer
    L.tileLayer(`https://maps.openweathermap.org/maps/2.0/weather/${this.activeMapLayer}/{z}/{x}/{y}?appid=${this.apiKey}`, {
      opacity: 0.8,
    }).addTo(this.leafletMap);
  }

  private initMapGestures() {
    const gesture = this.gestureCtrl.create({
      el: this.mapContainer.nativeElement,
      gestureName: 'map-gestures',
      onStart: () => this.onGestureStart(),
      onMove: (ev) => this.onGestureMove(ev),
      onEnd: () => this.onGestureEnd(),
      passive: true, // Mark the event listener as passive
    });
    gesture.enable();
  }

  private onGestureStart() {
    this.mapContainer.nativeElement.style.transition = 'none';
  }

  private onGestureMove(ev: any) {
    const currentTransform = this.mapContainer.nativeElement.style.transform || 'translate(0, 0)';
    const newTransform = `translate(${ev.deltaX}px, ${ev.deltaY}px)`;
    this.mapContainer.nativeElement.style.transform = newTransform;
  }

  private onGestureEnd() {
    this.mapContainer.nativeElement.style.transition = 'transform 0.3s ease-out';
    this.mapContainer.nativeElement.style.transform = 'translate(0, 0)';
  }

  zoomIn() {
    if (this.mapZoom < 12) this.mapZoom++;
  }

  zoomOut() {
    if (this.mapZoom > 3) this.mapZoom--;
  }

  // Dismiss the modal
  dismiss() {
    this.modalCtrl.dismiss();
  }
}
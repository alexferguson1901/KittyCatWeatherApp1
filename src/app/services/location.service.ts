import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor() { }

  async getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              reject(new Error('User denied Geolocation'));
            } else {
              reject(new Error('Unable to retrieve location'));
            }
          }
        );
      }
    });
  }

  async getLocationName(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
  
      // Extract city and country from the address field
      const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown city';
      const country = data.address?.country || 'Unknown country';
  
      return `${city}, ${country}`; // Return city and country
    } catch (error) {
      console.error('Error fetching location name:', error);
      return 'Unknown location';
    }
  }
}
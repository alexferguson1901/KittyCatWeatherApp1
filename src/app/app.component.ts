import { Component, Renderer2 } from '@angular/core';
import { PushService } from './services/push.service';

@Component({
  selector: 'app-root',
  template: '<ion-router-outlet></ion-router-outlet>',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private renderer: Renderer2, private push: PushService) {
    this.addGlobalMediaErrorHandler();
    this.initializePushNotifications();
  }

  addGlobalMediaErrorHandler() {
    this.renderer.listen('window', 'error', (event: Event) => {
      const target = event.target as HTMLImageElement | HTMLVideoElement;

      if (target && (target.tagName === 'IMG' || target.tagName === 'VIDEO')) {
        if (!target.getAttribute('data-error-handled')) {
          target.setAttribute('data-error-handled', 'true'); // Prevent infinite loops
          if (target.tagName === 'IMG') {
            target.src = 'assets/images/Fallback.PNG'; // Fallback image
          } else if (target.tagName === 'VIDEO') {
            target.src = 'assets/videos/FallbackVid.PNG'; // Fallback video
          }
        }
      }
    });
  }
  initializePushNotifications() {
    this.push.requestPermission(); // Request notification permission
    this.push.listenForMessages(); // Start listening for messages
  }
}

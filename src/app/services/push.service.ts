import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  currentToken: string | null = null;

  constructor(private afMessaging: AngularFireMessaging) {}

  requestPermission() {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        this.afMessaging.requestToken
          .pipe(take(1))
          .subscribe(
            (token) => {
              console.log('[FCM TOKEN]:', token);
              this.currentToken = token;
            },
            (error) => {
              console.error('Unable to get permission to notify.', error);
            }
          );
      }
    });
  }

  listenForMessages() {
    this.afMessaging.messages.subscribe((payload) => {
      console.log('[Foreground message received]', payload);
      alert((payload as any)?.notification?.title + ': ' + (payload as any)?.notification?.body);
    });
  }
}

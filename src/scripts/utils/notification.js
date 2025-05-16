import CONFIG from '../config';
import DicodingStoryApi from '../data/api';
import Auth from '../data/auth';

class NotificationService {
  static async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async subscribe() {
    if (!('serviceWorker' in navigator)) {
      console.log('This browser does not support service workers.');
      return false;
    }

    const permissionGranted = await this.requestPermission();
    if (!permissionGranted) {
      console.log('Notification permission denied.');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this._urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
      });

      const token = Auth.getUserToken();
      if (token) {
        await DicodingStoryApi.subscribePushNotification({ token, subscription });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }

  static async unsubscribe() {
    if (!('serviceWorker' in navigator)) {
      console.log('This browser does not support service workers.');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const token = Auth.getUserToken();
        if (token) {
          await DicodingStoryApi.unsubscribePushNotification({
            token,
            endpoint: subscription.endpoint,
          });
        }
        await subscription.unsubscribe();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  static showNotification(title, options) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        ...options
      });
      
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        window.location.href = '/';
      };
    }
  }

  static _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export default NotificationService;
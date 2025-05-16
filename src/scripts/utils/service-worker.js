import { Workbox } from 'workbox-window';

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Determine if we're in development or production
      const isDevelopment = process.env.NODE_ENV === 'development';
      const swPath = isDevelopment ? '/sw.bundle.js' : '/dicoding-story-app/sw.bundle.js';
      
      const wb = new Workbox(swPath);

      wb.addEventListener('installed', (event) => {
        if (event.isUpdate) {
          if (confirm('New app update is available! Click OK to refresh')) {
            window.location.reload();
          }
        }
      });

      wb.addEventListener('waiting', () => {
        console.log('Service worker is waiting. Update available!');
      });

      await wb.register();
      console.log('Service worker registered successfully');
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
};

export default registerServiceWorker;
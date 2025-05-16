class NetworkStatus {
  static #listeners = new Set();

  static isOnline() {
    return navigator.onLine;
  }

  static addStatusListener(callback) {
    if (typeof callback !== 'function') return;

    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    this.#listeners.add({ callback, handleOnline, handleOffline });
    
    // Initial call with current status
    callback(this.isOnline());
  }

  static removeStatusListener(callback) {
    const listener = Array.from(this.#listeners).find(l => l.callback === callback);
    if (!listener) return;

    window.removeEventListener('online', listener.handleOnline);
    window.removeEventListener('offline', listener.handleOffline);
    this.#listeners.delete(listener);
  }

  static showOfflineToast() {
    const existingToast = document.getElementById('offline-toast');
    if (existingToast) return;

    const toast = document.createElement('div');
    toast.id = 'offline-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #333;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 1000;
      font-family: -apple-system, system-ui, sans-serif;
      animation: slideUp 0.3s ease-out;
    `;
    toast.textContent = 'You are offline. Some features may be limited.';

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease-out forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  static init() {
    // Add global styles for animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from { transform: translate(-50%, 100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }
      @keyframes slideDown {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, 100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    window.addEventListener('offline', () => {
      this.showOfflineToast();
    });
  }
}

export default NetworkStatus; 
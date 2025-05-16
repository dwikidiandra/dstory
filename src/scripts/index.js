// CSS imports
import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import App from './pages/app';
import NetworkStatus from './utils/network-status';

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/dstory/sw.js');
      console.log('Service worker registered successfully:', registration.scope);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, show update notification if needed
            if (confirm('New content is available! Click OK to update.')) {
              window.location.reload();
            }
          }
        });
      });
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
};

const initializeApp = async () => {
  // Initialize network status monitoring
  NetworkStatus.init();

  const token = localStorage.getItem('token');
  
  if (!token && !window.location.hash.includes('#/login') && !window.location.hash.includes('#/register')) {
    window.location.hash = '#/login';
  }

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  
  await app.renderPage();

  const setupMobileMenu = () => {
    const drawerButton = document.getElementById('drawer-button');
    const navigationDrawer = document.getElementById('navigation-drawer');
    const overlay = document.getElementById('nav-overlay');
    
    if (!drawerButton || !navigationDrawer || !overlay) return;

    const toggleMenu = (show) => {
      const isExpanded = show ?? drawerButton.getAttribute('aria-expanded') !== 'true';
      drawerButton.setAttribute('aria-expanded', isExpanded);
      navigationDrawer.classList.toggle('open', isExpanded);
      overlay.classList.toggle('active', isExpanded);
      
      if (isExpanded) {
        document.body.classList.add('menu-open');
      } else {
        document.body.classList.remove('menu-open');
      }
    };

    toggleMenu(false);

    drawerButton.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    overlay.addEventListener('click', () => toggleMenu(false));

    navigationDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawerButton.getAttribute('aria-expanded') === 'true') {
        toggleMenu(false);
      }
    });

    const handleResize = () => {
      if (window.innerWidth > 999) {
        toggleMenu(false);
        drawerButton.style.display = 'none';
      } else {
        drawerButton.style.display = 'block';
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
  };

  setupMobileMenu();

  document.querySelector('.skip-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('main-content').focus();
  });

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
};

window.addEventListener('load', async () => {
  await registerServiceWorker();
  await initializeApp();
});
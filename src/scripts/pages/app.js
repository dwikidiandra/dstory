import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import Auth from '../data/auth';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._checkAuth();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  _checkAuth() {
    const token = Auth.getUserToken();
    const currentPath = window.location.hash.split('?')[0];
    
    const publicRoutes = ['#/login', '#/register', '#/about'];
    
    if (!token && !publicRoutes.includes(currentPath)) {
      window.location.hash = '#/login';
      return;
    }
    
    if (token && (currentPath === '#/login' || currentPath === '#/register')) {
      window.location.hash = '#/';
      return;
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    if (!page) {
      this.#content.innerHTML = `
        <section class="container">
          <div class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <h2>404 - Page Not Found</h2>
            <p>The page you're looking for doesn't exist.</p>
            <a href="#/" class="button primary">Go to Home</a>
          </div>
        </section>
      `;
      return;
    }

    if ('animate' in document.documentElement) {
      await this._customTransition(page);
    } 
    else if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        this._updateActiveNavLink();
        this._checkAuth();
      });
    } 
    else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this._updateActiveNavLink();
      this._checkAuth();
    }
  }

  async _customTransition(page) {
    const fadeOut = this.#content.animate(
      [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(20px)' }
      ],
      {
        duration: 300,
        easing: 'ease-in-out',
        fill: 'forwards'
      }
    );

    await fadeOut.finished;
    
    this.#content.innerHTML = await page.render();
    await page.afterRender();
    this._updateActiveNavLink();
    this._checkAuth();
    
    this.#content.animate(
      [
        { opacity: 0, transform: 'translateY(-20px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ],
      {
        duration: 300,
        easing: 'ease-in-out',
        fill: 'forwards'
      }
    );
  }

  _updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-list a');
    const currentPath = window.location.hash.split('?')[0];

    navLinks.forEach((link) => {
      const linkPath = link.getAttribute('href').split('?')[0];
      if (linkPath === currentPath || (linkPath === '#/' && currentPath === '')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

export default App;
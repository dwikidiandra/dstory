import HomePresenter from '../../presenters/home-presenter';

export default class HomePage {
  constructor() {
    this._presenter = new HomePresenter(this);
  }

  async render() {
    if (!this._presenter.isUserLoggedIn()) {
      window.location.hash = '#/login';
      return '';
    }

    return `
      <section class="hero">
        <div class="hero-content">
          <h1>Welcome, ${this._presenter.getUserName()}!</h1>
          <p>Kindly share your most recent learning journey on Dicoding</p>
          <a href="#/stories/add" class="button primary">Add Your Story</a>
        </div>
      </section>

      <section class="features container">
        <div class="feature-card">
          <i class="fas fa-book-open"></i>
          <h3>Your Stories</h3>
          <p>View and manage all the stories you have shared</p>
          <a href="#/stories" class="button small">View Stories</a>
        </div>
        <div class="feature-card">
          <i class="fas fa-map-marked-alt"></i>
          <h3>Story Map</h3>
          <p>Explore stories from various locations</p>
          <a href="#/map" class="button small">View Map</a>
        </div>
        <div class="feature-card">
          <i class="fas fa-cog"></i>
          <h3>Account</h3>
          <p>Manage the settings of your account</p>
          <a href="#" id="logout-btn" class="button small">Logout</a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    document.getElementById('logout-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this._presenter.logout();
    });
  }
}
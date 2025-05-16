import AuthPresenter from '../../presenters/auth-presenter';

export default class LoginPage {
  constructor() {
    this._presenter = new AuthPresenter(this);
  }

  async render() {
    if (this._presenter.isUserLoggedIn()) {
      return `
        <section class="container">
          <div class="already-logged-in">
            <h2>You are already logged in</h2>
            <p>You can now add stories and receive notifications.</p>
            <a href="#/" class="button primary">Go to Home</a>
          </div>
        </section>
      `;
    }

    return `
      <section class="auth-page container">
        <div class="auth-card">
          <h1>Login</h1>
          
          <form id="login-form" class="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required
                placeholder="your@email.com"
              >
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required
                placeholder="Your password"
                minlength="8"
              >
            </div>
            
            <div class="form-actions">
              <button type="submit" class="button primary">
                <i class="fas fa-sign-in-alt"></i> Login
              </button>
            </div>
            
            <div class="auth-footer">
              Don't have an account? <a href="#/register">Register</a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    if (this._presenter.isUserLoggedIn()) return;

    const form = document.getElementById('login-form');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
      
      await this._presenter.login({ email, password });
      
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    });
  }

  redirectToHome() {
    window.location.hash = '#/';
  }

  showError(message) {
    alert(`Login failed: ${message}`);
  }
}
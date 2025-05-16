import AuthPresenter from '../../presenters/auth-presenter';

export default class RegisterPage {
  constructor() {
    this._presenter = new AuthPresenter(this);
  }

  async render() {
    if (this._presenter.isUserLoggedIn()) {
      return `
        <section class="container">
          <div class="already-logged-in">
            <h2>You are already logged in</h2>
            <p>If you want to register a new account, please logout first.</p>
            <a href="#/" class="button primary">Go to Home</a>
          </div>
        </section>
      `;
    }

    return `
      <section class="auth-page container">
        <div class="auth-card">
          <h1>Register</h1>
          
          <form id="register-form" class="auth-form">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required
                placeholder="Your full name"
              >
            </div>
            
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
                placeholder="Your password (min 8 characters)"
                minlength="8"
              >
            </div>
            
            <div class="form-actions">
              <button type="submit" class="button primary">
                <i class="fas fa-user-plus"></i> Register
              </button>
            </div>
            
            <div class="auth-footer">
              Already have an account? <a href="#/login">Login</a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    if (this._presenter.isUserLoggedIn()) return;

    const form = document.getElementById('register-form');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
      
      await this._presenter.register({ name, email, password });
      
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Register';
    });
  }

  showSuccessAndRedirect() {
    alert('Registration successful! Please login with your credentials.');
    window.location.hash = '#/login';
  }

  showError(message) {
    alert(`Registration failed: ${message}`);
  }
}
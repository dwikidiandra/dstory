import Auth from '../data/auth';
import NotificationService from '../utils/notification';

export default class AuthPresenter {
  constructor(view) {
    this._view = view;
  }

  isUserLoggedIn() {
    return Auth.isUserLoggedIn();
  }

  async login({ email, password }) {
    try {
      await Auth.login({ email, password });
      await NotificationService.subscribe();
      this._view.redirectToHome();
    } catch (error) {
      this._view.showError(error.message);
    }
  }

  async register({ name, email, password }) {
    try {
      await Auth.register({ name, email, password });
      this._view.showSuccessAndRedirect();
    } catch (error) {
      this._view.showError(error.message);
    }
  }
}
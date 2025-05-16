import Auth from '../data/auth';

export default class AboutPresenter {
  constructor(view) {
    this._view = view;
  }

  isUserLoggedIn() {
    return Auth.isUserLoggedIn();
  }
}
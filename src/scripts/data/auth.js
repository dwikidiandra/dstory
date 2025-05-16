import DicodingStoryApi from './api';

class Auth {
  static isUserLoggedIn() {
    return !!this.getUserToken();
  }

  static getUserToken() {
    return localStorage.getItem('token');
  }

  static getUserName() {
    return localStorage.getItem('name');
  }

  static async register({ name, email, password }) {
    const response = await DicodingStoryApi.register({ name, email, password });
    return response;
  }

  static async login({ email, password }) {
    const response = await DicodingStoryApi.login({ email, password });
    localStorage.setItem('token', response.loginResult.token);
    localStorage.setItem('name', response.loginResult.name);
    localStorage.setItem('userId', response.loginResult.userId);
    
    window.location.hash = '#/';
    return response;
  }

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
    
    window.location.hash = '#/login';
  }
}

export default Auth;

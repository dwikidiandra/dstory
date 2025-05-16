import CONFIG from '../config';

class DicodingStoryApi {
  static async _handleResponse(response) {
    const responseJson = await response.json();
    
    if (!response.ok) {
      const errorMessage = responseJson.message || 
      `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return responseJson;
  }

  static async _fetchWithTimeout(resource, options = {}) {
    const { timeout = CONFIG.API_TIMEOUT } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal  
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.');
      }
      throw new Error('Network error. Please check your internet connection.');
    }
  }

  static async register({ name, email, password }) {
    try {
      const response = await this._fetchWithTimeout(`${CONFIG.BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      return this._handleResponse(response);
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  }

  static async login({ email, password }) {
    try {
      const response = await this._fetchWithTimeout(`${CONFIG.BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await this._handleResponse(response);
      
      if (!data.loginResult || !data.loginResult.token) {
        throw new Error('Invalid response from server');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  }

  static async getAllStories({ token, page = 1, size = 10, location = 0 }) {
    try {
      const response = await this._fetchWithTimeout(
        `${CONFIG.BASE_URL}/stories?page=${page}&size=${size}&location=${location}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await this._handleResponse(response);
      
      if (!Array.isArray(data.listStory)) {
        throw new Error('Invalid stories data format');
      }

      return data.listStory;
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw new Error(error.message || 'Failed to load stories. Please try again.');
    }
  }

  static async getStoryDetail(id, token) {
    try {
      const response = await this._fetchWithTimeout(`${CONFIG.BASE_URL}/stories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await this._handleResponse(response);
      
      if (!data.story) {
        throw new Error('Story not found');
      }

      return data.story;
    } catch (error) {
      console.error('Error fetching story detail:', error);
      throw new Error(error.message || 'Failed to load story details.');
    }
  }

  static async addNewStory({ token, data }) {
    try {
      if (!(data instanceof FormData)) {
        throw new Error('Invalid data format');
      }

      const response = await this._fetchWithTimeout(`${CONFIG.BASE_URL}/stories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      return this._handleResponse(response);
    } catch (error) {
      console.error('Error adding story:', error);
      throw new Error(error.message || 'Failed to add story. Please try again.');
    }
  }

  static async addNewStoryGuest({ data }) {
    try {
      const response = await this._fetchWithTimeout(`${CONFIG.BASE_URL}/stories/guest`, {
        method: 'POST',
        body: data,
      });

      return this._handleResponse(response);
    } catch (error) {
      console.error('Error adding guest story:', error);
      throw new Error(error.message || 'Failed to add story. Please try again.');
    }
  }

  static async subscribePushNotification({ token, subscription }) {
    try {
      const response = await this._fetchWithTimeout(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      return this._handleResponse(response);
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      throw new Error(error.message || 'Failed to subscribe to notifications.');
    }
  }

  static async unsubscribePushNotification({ token, endpoint }) {
    try {
      const response = await this._fetchWithTimeout(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint }),
      });

      return this._handleResponse(response);
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      throw new Error(error.message || 'Failed to unsubscribe from notifications.');
    }
  }
}

export default DicodingStoryApi;

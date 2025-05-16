import CONFIG from '../config';

class Database {
  constructor() {
    this._dbPromise = this._openDB();
  }

  _openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CONFIG.DATABASE_NAME, CONFIG.DATABASE_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains(CONFIG.OBJECT_STORE_NAME)) {
          const store = db.createObjectStore(CONFIG.OBJECT_STORE_NAME, { 
            keyPath: 'id' 
          });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('bookmarks')) {
          const bookmarksStore = db.createObjectStore('bookmarks', {
            keyPath: 'id'
          });
          bookmarksStore.createIndex('storyId', 'storyId', { unique: true });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getStory(id) {
    try {
      const db = await this._dbPromise;
      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, 'readonly');
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
      return store.get(id);
    } catch (error) {
      console.error('Error getting story:', error);
      throw error;
    }
  }

  async getAllStories() {
    try {
      const db = await this._dbPromise;
      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, 'readonly');
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
      return store.getAll();
    } catch (error) {
      console.error('Error getting all stories:', error);
      throw error;
    }
  }

  async putStory(story) {
    try {
      const db = await this._dbPromise;
      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
      return store.put(story);
    } catch (error) {
      console.error('Error putting story:', error);
      throw error;
    }
  }

  async putStories(stories) {
    try {
      const db = await this._dbPromise;
      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
      
      const promises = stories.map(story => store.put(story));
      await Promise.all(promises);
      
      return tx.complete;
    } catch (error) {
      console.error('Error putting stories:', error);
      throw error;
    }
  }

  async deleteStory(id) {
    try {
      const db = await this._dbPromise;
      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
      return store.delete(id);
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  }

  async clearStories() {
    try {
      const db = await this._dbPromise;
      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
      store.clear();
      return tx.complete;
    } catch (error) {
      console.error('Error clearing stories:', error);
      throw error;
    }
  }

  async getBookmarks() {
    try {
      const db = await this._dbPromise;
      const tx = db.transaction('bookmarks', 'readonly');
      const store = tx.objectStore('bookmarks');
      return store.getAll();
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      throw error;
    }
  }

  async addBookmark(story) {
    try {
      const db = await this._dbPromise;
      const tx = db.transaction('bookmarks', 'readwrite');
      const store = tx.objectStore('bookmarks');
      
      const bookmark = {
        id: `bookmark_${story.id}`,
        storyId: story.id,
        storyData: story,
        createdAt: new Date().toISOString()
      };
      
      return store.add(bookmark);
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }

  async removeBookmark(storyId) {
    try {
      const db = await this._dbPromise;
      const tx = db.transaction('bookmarks', 'readwrite');
      const store = tx.objectStore('bookmarks');
      
      const index = store.index('storyId');
      const request = index.get(storyId);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const bookmark = request.result;
          if (bookmark) {
            resolve(store.delete(bookmark.id));
          } else {
            resolve(false);
          }
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }

  async isBookmarked(storyId) {
    try {
      const db = await this._dbPromise;
      const tx = db.transaction('bookmarks', 'readonly');
      const store = tx.objectStore('bookmarks');
      const index = store.index('storyId');
      
      return new Promise((resolve) => {
        const request = index.get(storyId);
        request.onsuccess = () => {
          resolve(!!request.result);
        };
        request.onerror = () => {
          resolve(false);
        };
      });
    } catch (error) {
      console.error('Error checking bookmark:', error);
      return false;
    }
  }
}

export default new Database();
import { openDB } from 'idb';
import CONFIG from '../config';

class BookmarkDatabase {
  constructor() {
    this._dbPromise = this._initDb();
  }

  async _initDb() {
    return openDB(CONFIG.BOOKMARK_DATABASE_NAME, CONFIG.DATABASE_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(CONFIG.BOOKMARK_OBJECT_STORE_NAME)) {
          database.createObjectStore(CONFIG.BOOKMARK_OBJECT_STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  async getAllBookmarks() {
    try {
      const db = await this._dbPromise;
      const bookmarks = await db.getAll(CONFIG.BOOKMARK_OBJECT_STORE_NAME);
      return bookmarks || []; 
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      return []; 
    }
  }

  async getBookmark(id) {
    try {
      const db = await this._dbPromise;
      const tx = db.transaction(CONFIG.BOOKMARK_OBJECT_STORE_NAME, 'readonly');
      const store = tx.objectStore(CONFIG.BOOKMARK_OBJECT_STORE_NAME);
      return store.get(id);
    } catch (error) {
      console.error('Error getting bookmark:', error);
      throw error;
    }
  }

  async addBookmark(story) {
    try {
      const db = await this._dbPromise;
      const tx = db.transaction(CONFIG.BOOKMARK_OBJECT_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CONFIG.BOOKMARK_OBJECT_STORE_NAME);
      return store.put({
        ...story,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }

  async removeBookmark(id) {
    try {
      const db = await this._dbPromise;
      const tx = db.transaction(CONFIG.BOOKMARK_OBJECT_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CONFIG.BOOKMARK_OBJECT_STORE_NAME);
      return store.delete(id);
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }

  async isBookmarked(id) {
    try {
      const bookmark = await this.getBookmark(id);
      return !!bookmark;
    } catch (error) {
      console.error('Error checking bookmark:', error);
      return false;
    }
  }
}

export default new BookmarkDatabase();
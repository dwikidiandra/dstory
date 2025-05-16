import BookmarkDatabase from '../data/bookmark-database';

export default class BookmarkPresenter {
  constructor(view) {
    this._view = view;
    this._database = BookmarkDatabase;
  }

  async getAllBookmarks() {
    try {
      const bookmarks = await this._database.getAllBookmarks();
      this._view.showBookmarks(bookmarks);
    } catch (error) {
      this._view.showError(error.message);
    }
  }

  async toggleBookmark(story) {
    try {
      const isBookmarked = await this._database.isBookmarked(story.id);
      
      if (isBookmarked) {
        await this._database.removeBookmark(story.id);
        this._view.showBookmarkRemoved(story);
      } else {
        await this._database.addBookmark(story);
        this._view.showBookmarkAdded(story);
      }
      
      return !isBookmarked;
    } catch (error) {
      this._view.showError(error.message);
      throw error;
    }
  }

  async isBookmarked(id) {
    return this._database.isBookmarked(id);
  }
}
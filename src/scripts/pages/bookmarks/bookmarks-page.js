import BookmarkPresenter from '../../presenters/bookmark-presenter';

export default class BookmarksPage {
  constructor() {
    this._presenter = new BookmarkPresenter(this);
  }

  async render() {
    return `
      <section class="bookmarks container">
        <div class="bookmarks-header">
          <h1>Your Bookmarked Stories</h1>
        </div>
        
        <div class="bookmarks-list" id="bookmarks-list">
          <div class="loading">Loading bookmarks...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this._presenter.getAllBookmarks();
  }

  showBookmarks(bookmarks) {
    const bookmarksList = document.getElementById('bookmarks-list');
    
    const bookmarksArray = Array.isArray(bookmarks) ? bookmarks : [];
    
    if (bookmarksArray.length === 0) {
      bookmarksList.innerHTML = `
        <div class="empty">
          <i class="fas fa-bookmark"></i>
          <p>No bookmarked stories yet</p>
        </div>
      `;
      return;
    }

    bookmarksList.innerHTML = bookmarksArray
      .map((story) => `
        <article class="story-card">
          <div class="story-image">
            <img src="${story.photoUrl}" alt="${story.description}" loading="lazy">
          </div>
          <div class="story-content">
            <h2><a href="#/stories/${story.id}">${story.name}'s Story</a></h2>
            <p class="story-date">${new Date(story.createdAt).toLocaleDateString()}</p>
            <p class="story-desc">${story.description}</p>
            ${story.lat && story.lon ? `
              <p class="story-location">
                <i class="fas fa-map-marker-alt"></i> 
                ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}
              </p>
            ` : ''}
            <button class="button danger small remove-bookmark" data-id="${story.id}">
              <i class="fas fa-trash"></i> Remove Bookmark
            </button>
          </div>
        </article>
      `)
      .join('');

    document.querySelectorAll('.remove-bookmark').forEach(button => {
      button.addEventListener('click', async (e) => {
        const id = e.target.closest('button').dataset.id;
        await this._presenter.toggleBookmark({ id });
        await this._presenter.getAllBookmarks();
      });
    });
  }

  showBookmarkAdded(story) {
  }

  showBookmarkRemoved(story) {
  }

  showError(message) {
    document.getElementById('bookmarks-list').innerHTML = `
      <div class="error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message || 'Failed to load bookmarks'}</p>
      </div>
    `;
  }
}
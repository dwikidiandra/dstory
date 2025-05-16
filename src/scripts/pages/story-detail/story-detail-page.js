import StoryPresenter from '../../presenters/story-presenter';
import BookmarkDatabase from '../../data/bookmark-database';
import BookmarkPresenter from '../../presenters/bookmark-presenter';
import NotificationService from '../../utils/notification';

export default class StoryDetailPage {
  constructor() {
    this._storyId = null;
    this._presenter = new StoryPresenter(this);
    this._bookmarkDatabase = BookmarkDatabase;
    this._bookmarkPresenter = new BookmarkPresenter(this);
    this._isBookmarked = false;
  }

  async render() {
    const pathSegments = window.location.hash.split('/');
    this._storyId = pathSegments[pathSegments.length - 1];

    return `
      <section class="story-detail container">
        <div class="back-link">
          <a href="#/stories"><i class="fas fa-arrow-left"></i> Back to Stories</a>
        </div>
        
        <div id="story-content">
          <div class="loading">Loading story...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    try {
      const story = await this._presenter.getStoryDetail(this._storyId);
      this._isBookmarked = await this._bookmarkDatabase.isBookmarked(this._storyId);
      
      this.showStoryDetail(story);
      this._setupBookmarkButton(story);
    } catch (error) {
      this.showError(error.message);
    }
  }

  showStoryDetail(story) {
    const storyContent = document.getElementById('story-content');
    
    if (!story) {
      throw new Error('Story not found');
    }

    storyContent.innerHTML = `
      <article class="story-detail-card">
        <div class="story-detail-image">
          <img src="${story.photoUrl}" alt="${story.description || 'Story image'}" loading="lazy">
        </div>
        <div class="story-detail-info">
          <div class="story-header">
            <h1>${story.name || 'Anonymous'}'s Story</h1>
            <button id="bookmark-btn" class="button ${this._isBookmarked ? 'danger' : 'secondary'}" type="button">
              <i class="fas fa-bookmark"></i> ${this._isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
          </div>
          <p class="story-meta">
            <span class="story-date">
              <i class="far fa-calendar-alt"></i> ${this._presenter.formatDate(story.createdAt) || 'No date available'}
            </span>
            ${story.lat && story.lon ? `
              <span class="story-location">
                <i class="fas fa-map-marker-alt"></i> 
                ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}
              </span>
            ` : ''}
          </p>
          <div class="story-description">
            ${story.description || 'No description available'}
          </div>
          <div class="story-actions">
            <a href="#/stories" class="button secondary">
              <i class="fas fa-arrow-left"></i> Back to Stories
            </a>
            <a href="#/bookmarks" class="button primary">
              <i class="fas fa-bookmark"></i> View Bookmarks
            </a>
          </div>
        </div>
      </article>
      
      ${story.lat && story.lon ? `
        <div class="story-map" id="story-map"></div>
      ` : ''}
    `;

    if (story.lat && story.lon) {
      this._initMap(story.lat, story.lon);
    }
  }

  _setupBookmarkButton(story) {
    const bookmarkBtn = document.getElementById('bookmark-btn');
    if (!bookmarkBtn) return;

    bookmarkBtn.addEventListener('click', async (e) => {
      try {
        e.preventDefault();
        const isBookmarked = await this._bookmarkPresenter.toggleBookmark(story);
        bookmarkBtn.innerHTML = `<i class="fas fa-bookmark"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}`;
        bookmarkBtn.className = `button ${isBookmarked ? 'danger' : 'secondary'}`;
        
        NotificationService.showNotification(isBookmarked ? 'Bookmark Added' : 'Bookmark Removed', {
          body: `Story "${story.description.substring(0, 30)}..." ${isBookmarked ? 'added to' : 'removed from'} bookmarks`,
        });
      } catch (error) {
        console.error('Error toggling bookmark:', error);
        this.showError('Failed to update bookmark. Please try again.');
      }
    });
  }

  showError(message) {
    document.getElementById('story-content').innerHTML = `
      <div class="error">
        <i class="fas fa-exclamation-triangle"></i>
        <h2>Failed to load story</h2>
        <p>${message || 'Please try again later'}</p>
        <a href="#/stories" class="button primary">Back to Stories</a>
      </div>
    `;
  }

  _initMap(lat, lon) {
    import('leaflet').then((L) => {
      const map = L.map('story-map').setView([lat, lon], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const marker = L.marker([lat, lon]).addTo(map);
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-pin"></div>
          <div class="marker-dot"></div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
      });
      
      marker.setIcon(customIcon);
      marker.bindPopup('Story location').openPopup();
    });
  }

  showBookmarkAdded(story) {
    console.log(`Bookmark added for story: ${story.id}`);
  }

  showBookmarkRemoved(story) {
    console.log(`Bookmark removed for story: ${story.id}`);
  }
}
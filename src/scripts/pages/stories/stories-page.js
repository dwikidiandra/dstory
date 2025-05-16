import StoryPresenter from '../../presenters/story-presenter';

export default class StoriesPage {
  constructor() {
    this._page = 1;
    this._size = 10;
    this._presenter = new StoryPresenter(this);
  }

  async render() {
    return `
      <section class="stories container">
        <div class="stories-header">
          <h1>Dicoding Stories</h1>
          <a href="#/stories/add" class="button primary">
            <i class="fas fa-plus"></i> Add Story
          </a>
        </div>
        
        <div class="stories-list" id="stories-list"></div>
        
        <div class="pagination">
          <button id="prev-page" class="button secondary" disabled>
            <i class="fas fa-chevron-left"></i> Previous
          </button>
          <span>Page ${this._page}</span>
          <button id="next-page" class="button secondary">
            Next <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this._loadStories();
    this._setupPagination();
  }

  async _loadStories() {
    await this._presenter.getAllStories({
      page: this._page,
      size: this._size,
    });
  }

  showStories(stories) {
    const storiesList = document.getElementById('stories-list');
    
    if (stories.length === 0) {
      storiesList.innerHTML = '<div class="empty">No stories found. Be the first to share!</div>';
      return;
    }

    storiesList.innerHTML = stories
      .map((story) => `
        <article class="story-card">
          <div class="story-image">
            <img src="${story.photoUrl}" alt="${story.description}" loading="lazy">
          </div>
          <div class="story-content">
            <h2><a href="#/stories/${story.id}">${story.name}'s Story</a></h2>
            <p class="story-date">${this._presenter.formatDate(story.createdAt)}</p>
            <p class="story-desc">${story.description}</p>
            ${story.lat && story.lon ? `
              <p class="story-location">
                <i class="fas fa-map-marker-alt"></i> 
                ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}
              </p>
            ` : ''}
            <a href="#/stories/${story.id}" class="button small">Read More</a>
          </div>
        </article>
      `)
      .join('');

    document.getElementById('prev-page').disabled = this._page === 1;
  }

  showError(message) {
    document.getElementById('stories-list').innerHTML = `
      <div class="error">
        Failed to load stories. ${message}
      </div>
    `;
  }

  _setupPagination() {
    document.getElementById('prev-page').addEventListener('click', async () => {
      if (this._page > 1) {
        this._page--;
        await this._loadStories();
      }
    });

    document.getElementById('next-page').addEventListener('click', async () => {
      this._page++;
      await this._loadStories();
    });
  }
}
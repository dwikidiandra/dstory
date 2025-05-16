import StoryRepository from '../data/story-repository';

export default class StoryMapPresenter {
  constructor(view) {
    this._view = view;
    this._repository = StoryRepository;
  }

  async getAllStoriesWithLocation() {
    try {
      const stories = await this._repository.getAllStories({ location: 1 });
      this._view.showStoriesOnMap(stories);
    } catch (error) {
      this._view.showError(error.message);
    }
  }
}
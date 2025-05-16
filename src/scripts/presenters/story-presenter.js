import StoryRepository from '../data/story-repository';
import { showFormattedDate } from '../utils';

export default class StoryPresenter {
  constructor(view) {
    this._view = view;
    this._repository = StoryRepository;
  }

  async getAllStories({ page = 1, size = 10, location = 0 }) {
    try {
      const stories = await this._repository.getAllStories({ page, size, location });
      this._view.showStories(stories);
    } catch (error) {
      this._view.showError(error.message);
    }
  }

  async getStoryDetail(id) {
    try {
      const story = await this._repository.getStoryDetail(id);
      return story;
    } catch (error) {
      this._view.showError(error.message);
      throw error;
    }
  }

  async addNewStory({ description, photo, lat, lon }) {
    try {
      const response = await this._repository.addNewStory({ description, photo, lat, lon });
      this._view.showSuccess(response.message);
      return response;
    } catch (error) {
      this._view.showError(error.message);
      throw error;
    }
  }

  formatDate(date) {
    return showFormattedDate(date);
  }
}
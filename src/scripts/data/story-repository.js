import DicodingStoryApi from './api';
import Database from './database';
import Auth from './auth';

class StoryRepository {
  static async getAllStories({ page = 1, size = 10, location = 0 }) {
    try {
      const token = Auth.getUserToken();
      const stories = await DicodingStoryApi.getAllStories({ 
        token, 
        page, 
        size, 
        location 
      });
      
      if (stories.length > 0) {
        try {
          await Database.putStories(stories);
        } catch (error) {
          console.error('Failed to cache stories:', error);
        }
      }
      
      return stories;
    } catch (error) {
      console.error('Failed to fetch stories from API:', error);
      try {
        const cachedStories = await Database.getAllStories();
        if (cachedStories.length > 0) {
          return cachedStories;
        }
      } catch (dbError) {
        console.error('Failed to get cached stories:', dbError);
      }
      throw error;
    }
  }

  static async getStoryDetail(id) {
    try {
      const token = Auth.getUserToken();
      const story = await DicodingStoryApi.getStoryDetail(id, token);
      
      try {
        await Database.putStory(story);
      } catch (error) {
        console.error('Failed to cache story:', error);
      }
      
      return story;
    } catch (error) {
      console.error('Failed to fetch story detail from API:', error);
      try {
        const cachedStory = await Database.getStory(id);
        if (cachedStory) {
          return cachedStory;
        }
      } catch (dbError) {
        console.error('Failed to get cached story:', dbError);
      }
      throw error;
    }
  }

  static async addNewStory({ description, photo, lat, lon }) {
    try {
      const token = Auth.getUserToken();
      
      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photo);
      
      if (lat && lon) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }

      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      if (token) {
        return await DicodingStoryApi.addNewStory({ token, data: formData });
      }
      return await DicodingStoryApi.addNewStoryGuest({ data: formData });
    } catch (error) {
      console.error('Error adding new story:', error);
      throw new Error(error.message || 'Failed to add story. Please try again.');
    }
  }
}

export default StoryRepository;
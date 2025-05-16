import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import StoriesPage from '../pages/stories/stories-page';
import StoryDetailPage from '../pages/story-detail/story-detail-page';
import AddStoryPage from '../pages/add-story/add-story-page';
import StoryMapPage from '../pages/story-map/story-map-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import BookmarksPage from '../pages/bookmarks/bookmarks-page';

const routes = {
  '/': new HomePage(),
  '/home': new HomePage(),
  '/about': new AboutPage(),
  '/stories': new StoriesPage(),
  '/stories/:id': new StoryDetailPage(),
  '/stories/add': new AddStoryPage(),
  '/map': new StoryMapPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/bookmarks': new BookmarksPage(),
};

export default routes;
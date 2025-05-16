import AboutPresenter from '../../presenters/about-presenter';
import dlogo from '../../../public/images/dlogo.png';



export default class AboutPage {
  constructor() {
    this._presenter = new AboutPresenter(this);
  }

  async render() {
    return `
      <section class="about container">
        <h1>About Dicoding Story</h1>
        
        <div class="about-content">
          <div class="about-image">
           <img src="${dlogo}" alt="dlogo">
          </div>
          
          <div class="about-text">
            <p>
              Dicoding Story is a platform designed for Dicoding students to document and share their educational journey, 
              development projects, and personal experiences with the broader community.
            </p>
            
            <p>
              This application was developed as part of the submission for the Dicoding Intermediate Web Development course, 
              showcasing proficiency in Single Page Application architecture, API integration, 
              and the utilisation of modern web technologies.
            </p>
            
            <h2>Key Features</h2>
            <ul class="features-list">
              <li><i class="fas fa-check-circle"></i> Share stories accompanied by photographs</li>
              <li><i class="fas fa-check-circle"></i> Attach geographic locations to your stories</li>
              <li><i class="fas fa-check-circle"></i> Discover stories through an interactive map interface</li>
              <li><i class="fas fa-check-circle"></i> Receive real-time push notifications</li>
              <li><i class="fas fa-check-circle"></i> Full offline functionality enabled via a service worker</li>
            </ul>
            
            ${this._presenter.isUserLoggedIn() ? `
              <div class="about-actions">
                <a href="#/stories/add" class="button primary">
                  <i class="fas fa-plus"></i> Share Your Story
                </a>
              </div>
            ` : ''}
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
  }
}

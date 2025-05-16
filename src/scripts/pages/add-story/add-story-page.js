import StoryRepository from '../../data/story-repository';
import NotificationService from '../../utils/notification';
import Auth from '../../data/auth';
import CONFIG from '../../config';

export default class AddStoryPage {
  constructor() {
    this._photoFile = null;
    this._map = null;
    this._marker = null;
    this._lat = null;
    this._lon = null;
    this._cameraStream = null;
    this._isLoading = false;
    this._eventListeners = []; // Untuk menyimpan reference event listeners
  }

  async render() {
    if (!Auth.isUserLoggedIn()) {
      return `
        <section class="container">
          <div class="auth-required">
            <h2>🔐 Login Required</h2>
            <p>Please login to share your story</p>
            <div class="auth-buttons">
              <a href="#/login" class="button primary">Login</a>
              <a href="#/register" class="button secondary">Register</a>
            </div>
          </div>
        </section>
      `;
    }

    return `
      <section class="add-story">
        <div class="container">
          <div class="add-story-header">
            <h1><i class="fas fa-plus-circle"></i> Share Your Story</h1>
            <p class="subtitle">Capture your learning journey moments</p>
          </div>

          <form id="story-form" class="story-form">
            <div class="form-group">
              <label for="description"><i class="fas fa-align-left"></i> Story Description</label>
              <textarea 
                id="description" 
                name="description" 
                required
                placeholder="Tell us about your experience..."
                class="form-control"
              ></textarea>
            </div>

            <div class="form-group">
              <label><i class="fas fa-camera"></i> Add Photo</label>
              <div class="photo-upload-container">
                <div class="upload-options">
                  <button type="button" id="from-storage" class="button secondary">
                    <i class="fas fa-folder-open"></i> Choose File
                  </button>
                  
                  <button type="button" id="from-camera" class="button secondary">
                    <i class="fas fa-camera"></i> Take Photo
                  </button>
                </div>
                
                <div class="upload-preview">
                  <div id="photo-status">
                    <span id="photo-name">No file selected</span>
                    <span id="photo-size" class="file-size"></span>
                  </div>
                  <div id="photo-preview" class="preview-image"></div>
                  <button type="button" id="remove-photo" class="button danger small">
                    <i class="fas fa-trash"></i> Remove
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label><i class="fas fa-map-marker-alt"></i> Add Location (Optional)</label>
              <div class="location-controls">
                <button type="button" id="select-location" class="button small">
                  <i class="fas fa-map"></i> Select on Map
                </button>
                <span id="location-status">No location selected</span>
              </div>
              <div id="map-container" class="map-preview"></div>
            </div>

            <div class="form-actions">
              <button type="submit" class="button primary" id="submit-button">
                <i class="fas fa-paper-plane"></i> Publish Story
              </button>
            </div>
          </form>

          <div id="error-message" class="error-message" hidden></div>
        </div>
      </section>

      <!-- Camera Modal -->
      <div id="camera-modal" class="modal camera-modal" hidden>
        <div class="modal-content">
          <div class="modal-header">
            <h3>Take Photo</h3>
            <button id="close-camera" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <video id="camera-view" autoplay playsinline></video>
            <button id="capture-btn" class="button primary">
              <i class="fas fa-camera"></i> Capture
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    if (!Auth.isUserLoggedIn()) return;

    this._setupPhotoUpload();
    this._setupLocation();
    this._setupFormSubmit();
    this._setupCamera();

    // Add hashchange listener to stop camera when navigating away
    this._addEventListener(window, 'hashchange', () => this._stopCamera());
  }

  unmount() {
    // Hentikan kamera jika aktif
    this._stopCamera();
    
    // Hapus semua event listeners
    this._eventListeners.forEach(({ element, type, callback }) => {
      element.removeEventListener(type, callback);
    });
    this._eventListeners = [];
    
    // Hapus map jika ada
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
    
    // Hapus input file yang dibuat secara dinamis
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
      if (input.parentNode === document.body) {
        document.body.removeChild(input);
      }
    });

    // Close camera modal if open
    const cameraModal = document.getElementById('camera-modal');
    if (cameraModal) {
      cameraModal.hidden = true;
    }
  }

  _addEventListener(element, type, callback) {
    element.addEventListener(type, callback);
    this._eventListeners.push({ element, type, callback });
  }

  _setupPhotoUpload() {
    const fromStorageBtn = document.getElementById('from-storage');
    const fromCameraBtn = document.getElementById('from-camera');
    const photoInput = document.createElement('input');
    photoInput.type = 'file';
    photoInput.accept = 'image/*';
    photoInput.hidden = true;
    document.body.appendChild(photoInput);

    const photoName = document.getElementById('photo-name');
    const photoSize = document.getElementById('photo-size');
    const photoPreview = document.getElementById('photo-preview');
    const removePhotoBtn = document.getElementById('remove-photo');

    this._addEventListener(fromStorageBtn, 'click', () => photoInput.click());
    this._addEventListener(fromCameraBtn, 'click', () => this._openCameraModal());

    this._addEventListener(photoInput, 'change', (e) => {
      const file = e.target.files[0];
      if (file) this._handleSelectedFile(file);
    });

    this._addEventListener(removePhotoBtn, 'click', () => {
      this._photoFile = null;
      photoInput.value = '';
      photoName.textContent = 'No file selected';
      photoSize.textContent = '';
      photoPreview.innerHTML = '';
      removePhotoBtn.style.display = 'none';
    });
  }

  _openCameraModal() {
    const cameraModal = document.getElementById('camera-modal');
    cameraModal.hidden = false;
    
    // Stop any existing camera stream before starting new one
    this._stopCamera();
    
    navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    }).then(stream => {
      this._cameraStream = stream;
      const cameraView = document.getElementById('camera-view');
      cameraView.srcObject = stream;
    }).catch(error => {
      console.error('Error accessing camera:', error);
      this._showError('Cannot access camera. Please ensure permissions are granted.');
      cameraModal.hidden = true;
    });
  }

  _handleSelectedFile(file) {
    const photoName = document.getElementById('photo-name');
    const photoSize = document.getElementById('photo-size');
    const photoPreview = document.getElementById('photo-preview');
    const removePhotoBtn = document.getElementById('remove-photo');
    const errorMessage = document.getElementById('error-message');

    if (!file) return;

    if (!file.type.match('image.*')) {
      this._showError('File must be an image (JPEG, PNG, etc)');
      return;
    }

    if (file.size > CONFIG.MAX_FILE_SIZE) {
      this._showError(`File size too large (max ${CONFIG.MAX_FILE_SIZE/1024/1024}MB)`);
      return;
    }

    this._photoFile = file;
    photoName.textContent = file.name;
    photoSize.textContent = `(${(file.size/1024).toFixed(2)} KB)`;
    removePhotoBtn.style.display = 'block';
    errorMessage.hidden = true;

    const reader = new FileReader();
    reader.onload = (event) => {
      photoPreview.innerHTML = `
        <img src="${event.target.result}" alt="Preview" class="preview-img">
      `;
    };
    reader.readAsDataURL(file);
  }

  _setupCamera() {
    const cameraModal = document.getElementById('camera-modal');
    const captureBtn = document.getElementById('capture-btn');
    const closeCameraBtn = document.getElementById('close-camera');

    this._addEventListener(captureBtn, 'click', () => {
      const cameraView = document.getElementById('camera-view');
      const canvas = document.createElement('canvas');
      canvas.width = cameraView.videoWidth;
      canvas.height = cameraView.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(cameraView, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'camera-photo.jpg', { 
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        this._handleSelectedFile(file);
        this._stopCamera();
        cameraModal.hidden = true;
      }, 'image/jpeg', 0.9);
    });

    this._addEventListener(closeCameraBtn, 'click', () => {
      this._stopCamera();
      cameraModal.hidden = true;
    });

    // Close modal when clicking outside
    this._addEventListener(cameraModal, 'click', (e) => {
      if (e.target === cameraModal) {
        this._stopCamera();
        cameraModal.hidden = true;
      }
    });
  }

  _stopCamera() {
    if (this._cameraStream) {
      this._cameraStream.getTracks().forEach(track => track.stop());
      this._cameraStream = null;
      const cameraView = document.getElementById('camera-view');
      if (cameraView) cameraView.srcObject = null;
    }
  }

  _setupLocation() {
    const selectLocationBtn = document.getElementById('select-location');
    const locationStatus = document.getElementById('location-status');
    const mapContainer = document.getElementById('map-container');

    this._addEventListener(selectLocationBtn, 'click', async () => {
      if (this._isLoading) return;
      
      this._isLoading = true;
      selectLocationBtn.disabled = true;
      selectLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading Map...';
      
      try {
        await this._initMap();
        locationStatus.textContent = 'Click on the map to select location';
      } catch (error) {
        console.error('Map initialization error:', error);
        this._showError('Failed to load map. Please try again.');
        locationStatus.textContent = 'Map load failed';
      } finally {
        selectLocationBtn.disabled = false;
        selectLocationBtn.innerHTML = '<i class="fas fa-map"></i> Select on Map';
        this._isLoading = false;
      }
    });
  }

  async _initMap() {
    try {
      const L = await import('leaflet');
      
      if (this._map) this._map.remove();
      
      // Default to Indonesia center if no location selected
      const center = this._lat && this._lon ? [this._lat, this._lon] : [-2.5489, 118.0149];
      this._map = L.map('map-container').setView(center, 5);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this._map);
      
      if (this._marker) this._map.removeLayer(this._marker);
      
      // Add click event to select location
      this._map.on('click', (e) => {
        this._lat = e.latlng.lat;
        this._lon = e.latlng.lng;
        
        if (this._marker) this._map.removeLayer(this._marker);
        
        // Create custom marker
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="marker-pin"></div>
            <div class="marker-dot"></div>
          `,
          iconSize: [30, 42],
          iconAnchor: [15, 42]
        });
        
        this._marker = L.marker([this._lat, this._lon], {
          icon: customIcon
        })
          .addTo(this._map)
          .bindPopup('Selected story location')
          .openPopup();
          
        document.getElementById('location-status').textContent = 
          `Location: ${this._lat.toFixed(4)}, ${this._lon.toFixed(4)}`;
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      throw error;
    }
  }

  _setupFormSubmit() {
    const form = document.getElementById('story-form');
    const submitButton = document.getElementById('submit-button');
    
    this._addEventListener(form, 'submit', async (e) => {
      e.preventDefault();
      
      if (this._isLoading) return;
      
      const description = document.getElementById('description').value.trim();
      
      if (!description) {
        this._showError('Please enter story description');
        return;
      }
      
      if (!this._photoFile) {
        this._showError('Please add a photo');
        return;
      }
      
      this._isLoading = true;
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
      
      try {
        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', this._photoFile);
        
        if (this._lat && this._lon) {
          formData.append('lat', this._lat);
          formData.append('lon', this._lon);
        }

        const response = await StoryRepository.addNewStory({
          description,
          photo: this._photoFile,
          lat: this._lat,
          lon: this._lon
        });

        if (response.error) throw new Error(response.message);
        
        NotificationService.showNotification('Story Published', {
          body: `Your story "${description.substring(0, 30)}..." has been published`,
          icon: '/icons/icon-192x192.png'
        });
        
        window.location.hash = '#/stories';
      } catch (error) {
        console.error('Failed to add story:', error);
        this._showError(`Failed to publish story: ${error.message}`);
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Publish Story';
        this._isLoading = false;
      }
    });
  }

  _showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.innerHTML = `
      <i class="fas fa-exclamation-circle"></i> ${message}
    `;
    errorMessage.hidden = false;
    setTimeout(() => {
      errorMessage.hidden = true;
    }, 5000);
  }
}
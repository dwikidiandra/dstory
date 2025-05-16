import StoryRepository from '../../data/story-repository';
import L from 'leaflet';

export default class StoryMapPage {
  constructor() {
    this._map = null;
    this._markers = [];
    this._baseLayers = {};
    this._overlays = {};
  }

  async render() {
    return `
      <section class="story-map-page container">
        <h1>Stories Map</h1>
        <p>Discover Dicoding stories from various regions and locations</p>
        <div id="map" class="story-map-container"></div>
        <div id="layer-control" class="layer-control"></div>
      </section>
    `;
  }

  async afterRender() {
    await this._initMap();
    await this._loadStories();
    this._setupLayerControl();
  }

  async _initMap() {
    this._map = L.map('map').setView([-2.5489, 118.0149], 5);
    
    this._baseLayers = {
      "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }),
      "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }),
      "Topography": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      })
    };

    this._baseLayers["OpenStreetMap"].addTo(this._map);
  }

  async _loadStories() {
    try {
      const stories = await StoryRepository.getAllStories({ location: 1 });
      
      // Clear existing markers
      this._markers.forEach(marker => this._map.removeLayer(marker));
      this._markers = [];
      
      const createCustomIcon = () => {
        return L.divIcon({
          html: `
            <div class="custom-marker">
              <div class="marker-pin"></div>
              <div class="marker-dot"></div>
            </div>
          `,
          className: 'custom-marker-container',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        });
      };

      const markersLayer = L.layerGroup();
      
      stories.forEach(story => {
        if (story.lat && story.lon) {
          const marker = L.marker([story.lat, story.lon], {
            icon: createCustomIcon(),
            alt: `${story.name}'s Story Location`
          })
          .bindPopup(`
            <div class="map-popup">
              <b>${story.name}'s Story</b>
              <p>${story.description.substring(0, 50)}...</p>
              <a href="#/stories/${story.id}">Read more</a>
            </div>
          `);
          
          markersLayer.addLayer(marker);
          this._markers.push(marker);
        }
      });

      markersLayer.addTo(this._map);
      this._overlays = {
        "Story Markers": markersLayer
      };

      if (this._markers.length > 0) {
        this._map.fitBounds(markersLayer.getBounds());
      }
    } catch (error) {
      console.error('Failed to load stories:', error);
    }
  }

  _setupLayerControl() {
    L.control.layers(this._baseLayers, this._overlays, {
      position: 'topright',
      collapsed: false
    }).addTo(this._map);
  }
}
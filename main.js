import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import XYZ from 'ol/source/XYZ.js';
import {ScaleLine, defaults as defaultControls} from 'ol/control.js';

import {MousePosition} from 'ol/control';
import {createStringXY} from 'ol/coordinate';

import DragAndDrop from 'ol/interaction/DragAndDrop';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileWMS from 'ol/source/TileWMS';




// mouse position?
const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(6),
  projection: 'EPSG:4326',
  className: 'custom-mouse-position',
  target: document.getElementById('coordinates'), // Updated target
  undefinedHTML: '&nbsp;',
});



// scalebars
const scaleControl = new ScaleLine({
  units: 'metric',
  bar: true,
  steps: 4,
  text: true,
  minWidth: 140,
});






const map = new Map({
  controls: defaultControls().extend([scaleControl, mousePositionControl]),
 
  target: 'map',
  
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: [2650472.1246, 7424538.4154],
    // projection: 'EPSG:4326',
   
    zoom: 7,
  }),
});

// New WMS Layer
const newWmsLayer = new TileLayer({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/Lithuania/wms',
    params: {
      'LAYERS': 'Lithuania:Lithuania_DEM',
      'TILED': true,
    },
    serverType: 'geoserver',
    // Add this if your GeoServer supports cross-origin requests
    
  }),
});

map.addLayer(newWmsLayer);


// drag drop
const source = new VectorSource();
const layer = new VectorLayer({
  source: source,
});
map.addLayer(layer);



map.addInteraction(
  new DragAndDrop({
    source: source,
    formatConstructors: [GeoJSON],
  })
);










// search for place 


const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

searchForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const searchQuery = searchInput.value;
  const geocodingUrl = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&addressdetails=1`;

  fetch(geocodingUrl)
    .then(response => response.json())
    .then(data => {
      console.log('Geocoding Response:', data); // Log the geocoding response for debugging

      if (data.length > 0) {
        const latitude = parseFloat(data[0].lat);
        const longitude = parseFloat(data[0].lon);
        const center = fromLonLat([longitude, latitude]);

        map.getView().animate({ center, zoom: 12 });
      }
    })
    .catch(error => {
      console.error('Error during geocoding:', error);
    });
});
// home button refresh the page 
const homeButton = document.getElementById('homeButton');
const navbarBrand = document.querySelector('.navbar-brand');

const refreshPage = function() {
  location.reload();
};

homeButton.addEventListener('click', refreshPage);
navbarBrand.addEventListener('click', refreshPage);


// select basemap
// add an event listener for the basemap select dropdown
const basemapSelect = document.getElementById('basemap-select');
basemapSelect.addEventListener('change', function (event) {
  const selectedValue = event.target.value;
  let newLayerSource;

  if (selectedValue === 'satellite') {
    // replace the OSM source with a satellite source
    newLayerSource = new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        tileSize: 512,
        maxZoom: 20,
      }),
    });
  } else if (selectedValue === 'CartoDb') {
    // replace the OSM source with a CartoDB source
    newLayerSource = new TileLayer({
      source: new XYZ({
        url: 'http://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      }),
    });
  } else if (selectedValue === 'Esri Gray (light)') {
    // replace the OSM source with a Esri Gray (light) source
    newLayerSource = new TileLayer({
      source: new XYZ({
        url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      }),
    });
  } else if (selectedValue === 'Esri Gray (dark)') {
    // replace the OSM source with a Esri Gray (light) source
    newLayerSource = new TileLayer({
      source: new XYZ({
        url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      }),
    });
  } else {
    // use the default OSM source
    newLayerSource = new TileLayer({
      source: new OSM(),
    });
  }

  // remove the old layer and add the new one
  map.getLayers().removeAt(0);
  map.getLayers().insertAt(0, newLayerSource);
});



// Layer controls toggles 

const layer1Checkbox = document.getElementById('layer1');
layer1Checkbox.addEventListener('change', function() {
  newWmsLayer.setVisible(this.checked);
});
// DEM Opasicty 
opacitySlider.addEventListener('input', function() {
  newWmsLayer.setOpacity(parseFloat(this.value));
});



'use strict';

var {Viewer} = mapillary;

const ACCESS_TOKEN  = require('../../data/mly_token.json');

var mjs;

var setMarker = function(map, img) {
  var imgPoint = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'Point',
      'coordinates': [img.originalLngLat.lng, img.originalLngLat.lat]
    }
  };

  if (!map.getSource('mapillary-marker')) {
    map.addSource('mapillary-marker', {
      'type': 'geojson',
      'data': imgPoint
    });
  } else {
    map.getSource('mapillary-marker').setData(imgPoint);
  }

  if (!map.getLayer('mapillary-marker')) {
    map.addLayer({
      'id': 'mapillary-marker',
      'type': 'circle',
      'source': 'mapillary-marker',
      'paint': {
        'circle-stroke-color': 'white',
        'circle-stroke-width': 2,
        'circle-stroke-opacity': 1,
        'circle-radius': 8,
        'circle-color': 'orange',
        'circle-opacity': 1
      }
    });
  }
  map.moveLayer('mapillary-marker');
}

var init = function(map) {
  mjs = new Viewer({
    accessToken: ACCESS_TOKEN,
    container: 'mjs',
    component: { cover: false }
  });

  mjs.on("image", function() {
    mjs.getImage().then(function(img) {
      setMarker(map, img);
    });
  });
}

var setCurrentImage = function(id) {
  mjs.moveTo(id);
}

var filterImages = function(ids) {
  mjs.setFilter(['in', 'id', ...ids]);
}

module.exports = {
  init: init,
  filterImages: filterImages,
  setCurrentImage: setCurrentImage
};

'use strict';

var turf = require('@turf/turf')

var images = require('../../data/mapillary.json');
var viewer = require('./viewer.js');

var resetImagesLayer = function(map) {
  if (map.getLayer('mapillary-images')) {
    map.removeLayer('mapillary-images');
  }
  if (map.getSource('mapillary-images')) {
    map.removeSource('mapillary-images');
  }
}

var imageIds = [];

var plotAround = function(map, geojsonLine) {
  var buffer = turf.buffer(geojsonLine, 0.005);

  imageIds.length = 0;
  for (var i = 0; i < images.features.length; i++) {
    var f = images.features[i];
    if (turf.booleanPointInPolygon(f.geometry.coordinates, buffer)) {
      f.properties.show = true;
      imageIds.push(f.properties.id);
    } else {
      delete f.properties.show;
    }
  }

  resetImagesLayer(map);

  map.addSource('mapillary-images', {
    'type': 'geojson',
    'data': images
  });

  map.addLayer({
    'id': 'mapillary-images',
    'type': 'circle',
    'source': 'mapillary-images',
    'paint': {
      'circle-radius': 4,
      'circle-color': 'violet',
      'circle-opacity': 0.8
    },
    'filter': ['has', 'show']
  });

  if (imageIds.length > 0) {
    viewer.setCurrentImage(imageIds[0]);
  }
}

module.exports = {
  plotAround: plotAround
};

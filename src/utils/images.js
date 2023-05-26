'use strict';

var turf = require('@turf/turf')

var mapillary = require('../../data/mapillary.json');

var resetImages = function(map) {
  if (map.getLayer('mapillary-images')) {
    map.removeLayer('mapillary-images');
  }
  if (map.getSource('mapillary-images')) {
    map.removeSource('mapillary-images');
  }
}

var plotAround = function(map, geojsonLine) {
  var buffer = turf.buffer(geojsonLine, 0.005);

  for (var i = 0; i < mapillary.features.length; i++) {
    var f = mapillary.features[i];
    if (turf.booleanPointInPolygon(f.geometry.coordinates, buffer)) {
      f.properties.show = true;
    } else {
      delete f.properties.show;
    }
  }

  resetImages(map);

  map.addSource('mapillary-images', {
    'type': 'geojson',
    'data': mapillary
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
}


module.exports = {
  plotAround: plotAround
};


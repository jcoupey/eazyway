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

var plotAround = function(map, geojsonLine, start) {
  var buffer = turf.buffer(geojsonLine, 0.005);

  imageIds.length = 0;
  var startImage;
  var smallestStartDistance = Infinity;

  for (var i = 0; i < images.features.length; i++) {
    var f = images.features[i];
    if (turf.booleanPointInPolygon(f.geometry.coordinates, buffer)) {
      f.properties.show = true;
      imageIds.push(f.properties.id);
      var startDistance = turf.distance([start.lng, start.lat],
                                        f.geometry.coordinates, {units: 'kilometers'});
      if (startDistance < smallestStartDistance) {
        startImage = f.properties.id;
        smallestStartDistance = startDistance;
      }
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
      'circle-color': 'violet',
      'circle-opacity': 0.8
    },
    'filter': ['has', 'show']
  });

  map.on('mouseenter', 'mapillary-images', function () {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'mapillary-images', function () {
    map.getCanvas().style.cursor = '';
  });

  map.on('click', 'mapillary-images', function (e) {
    viewer.setCurrentImage(e.features[0].properties.id);
  });

  map.setPaintProperty('mapillary-images', 'circle-radius', [
    'interpolate',
    ['linear'],
    ['zoom'],
    15,
    1,
    22,
    12
  ]);

  if (imageIds.length > 0) {
    viewer.setCurrentImage(startImage);
  }
}

module.exports = {
  plotAround: plotAround
};

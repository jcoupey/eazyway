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

  viewer.hideMarker();
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
      imageIds.push(f.properties.id.toString());
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

  map.addSource('mapillary-images', {
    'type': 'geojson',
    'data': images
  });

  map.addLayer({
    'id': 'mapillary-images',
    'type': 'circle',
    'source': 'mapillary-images',
    'paint': {
      'circle-color': '#25e0c5',
      'circle-opacity': 1,
      'circle-blur': 0.9
    },
    'filter': ['has', 'show']
  });

  map.moveLayer('mapillary-images');

  map.on('mouseenter', 'mapillary-images', function () {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'mapillary-images', function () {
    map.getCanvas().style.cursor = '';
  });

  map.on('click', 'mapillary-images', function (e) {
    if(!e.originalEvent.defaultPrevented) {
      e.originalEvent.preventDefault();
      viewer.setCurrentImage(e.features[0].properties.id);
    }
  });

  map.setPaintProperty('mapillary-images',
                       'circle-radius', [
                         'interpolate',
                         ['linear'],
                         ['zoom'],
                         15,
                         2,
                         22,
                         14
                       ]);

  if (imageIds.length > 0) {
    viewer.filterImages(imageIds);
    viewer.setCurrentImage(startImage);
  }
};

module.exports = {
  plotAround: plotAround,
  resetImagesLayer: resetImagesLayer
};

'use strict';

var turf = require('@turf/turf')

var obstacles = require('../../data/obstacles.json');

var resetObstaclesLayer = function(map) {
  if (map.getLayer('obstacles')) {
    map.removeLayer('obstacles');
  }
  if (map.getSource('obstacles')) {
    map.removeSource('obstacles');
  }
}

var plotAround = function(map, geojsonLine) {
  var buffer = turf.buffer(geojsonLine, 0.005);

  for (var i = 0; i < obstacles.features.length; i++) {
    var o = obstacles.features[i];
    if (turf.booleanPointInPolygon(o.geometry.coordinates, buffer)) {
      o.properties.show = true;
    } else {
      delete o.properties.show;
    }
  }

  resetObstaclesLayer(map);

  map.addSource('obstacles', {
    'type': 'geojson',
    'data': obstacles
  });

  map.addLayer({
    'id': 'obstacles',
    'type': 'symbol',
    'source': 'obstacles',
    'layout': {
      'icon-image': 'danger'
    },
    'filter': ['has', 'show']
  });

  map.moveLayer('obstacles');

  map.on('mouseenter', 'obstacles', function () {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'obstacles', function () {
    map.getCanvas().style.cursor = '';
  });
}

module.exports = {
  plotAround: plotAround
};

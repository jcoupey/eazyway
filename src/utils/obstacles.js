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

var popup = new maplibregl.Popup({
closeButton: false,
closeOnClick: false
});

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
      'icon-image': 'danger',
      'icon-overlap': 'always'
    },
    'filter': ['has', 'show']
  });

  map.on('mouseenter', 'obstacles', function (e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.id;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    popup.setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
  });

  map.on('mouseleave', 'obstacles', function () {
    popup.remove();
  });
}

module.exports = {
  plotAround: plotAround
};

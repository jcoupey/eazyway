'use strict';

var turf = require('@turf/turf')

var obstacles = require('../../data/obstacles.json');

var resetObstaclesLayer = function(map) {
  if (map.getLayer('wheelchair-danger')) {
    map.removeLayer('wheelchair-danger');
  }
  if (map.getLayer('wheelchair-problem')) {
    map.removeLayer('wheelchair-problem');
  }
  if (map.getLayer('sight-danger')) {
    map.removeLayer('sight-danger');
  }
  if (map.getLayer('sight-problem')) {
    map.removeLayer('sight-problem');
  }
  if (map.getSource('obstacles')) {
    map.removeSource('obstacles');
  }
}

var popup = new maplibregl.Popup().setMaxWidth('400px');

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

  map.addSource('obstacles', {
    'type': 'geojson',
    'data': obstacles
  });

  map.addLayer({
    'id': 'wheelchair-problem',
    'type': 'symbol',
    'source': 'obstacles',
    'layout': {
      'icon-image': 'wheelchair-problem',
      'icon-overlap': 'always'
    },
    'filter': ['all',
               ['has', 'show'],
               ['==', 'wheelchair', ['get', 'type']],
               ['==', 'problem', ['get', 'level']]
              ]
  });

  map.addLayer({
    'id': 'wheelchair-danger',
    'type': 'symbol',
    'source': 'obstacles',
    'layout': {
      'icon-image': 'wheelchair-danger',
      'icon-overlap': 'always'
    },
    'filter': ['all',
               ['has', 'show'],
               ['==', 'wheelchair', ['get', 'type']],
               ['==', 'danger', ['get', 'level']]
              ]
  });

  map.addLayer({
    'id': 'sight-problem',
    'type': 'symbol',
    'source': 'obstacles',
    'layout': {
      'icon-image': 'sight-problem',
      'icon-overlap': 'always'
    },
    'filter': ['all',
               ['has', 'show'],
               ['==', 'sight', ['get', 'type']],
               ['==', 'problem', ['get', 'level']]
              ]
  });

  map.addLayer({
    'id': 'sight-danger',
    'type': 'symbol',
    'source': 'obstacles',
    'layout': {
      'icon-image': 'sight-danger',
      'icon-overlap': 'always'
    },
    'filter': ['all',
               ['has', 'show'],
               ['==', 'sight', ['get', 'type']],
               ['==', 'danger', ['get', 'level']]
              ]
  });

  const layers = [
    'wheelchair-danger',
    'wheelchair-problem',
    'sight-danger',
    'sight-problem'
  ];
  for (var l = 0; l < layers.length; ++l) {
    map.on('mouseenter', layers[l], function (e) {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', layers[l], function () {
      map.getCanvas().style.cursor = '';
    });

    map.on('click', layers[l], function (e) {
      if(!e.originalEvent.defaultPrevented) {
        e.originalEvent.preventDefault();

        var coordinates = e.features[0].geometry.coordinates.slice();
        var html = '<img class="popup-img" src="img/obstacles/' + e.features[0].properties.id + '.jpg">';

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        popup.setLngLat(coordinates)
          .setHTML(html)
          .addTo(map);
      }
    });
  }
};

var moveLayers = function(map) {
  if (map.getLayer('wheelchair-danger')) {
    map.moveLayer('wheelchair-danger');
  }
  if (map.getLayer('wheelchair-problem')) {
    map.moveLayer('wheelchair-problem');
  }
  if (map.getLayer('sight-danger')) {
    map.moveLayer('sight-danger');
  }
  if (map.getLayer('sight-problem')) {
    map.moveLayer('sight-problem');
  }
};

module.exports = {
  plotAround: plotAround,
  resetObstaclesLayer: resetObstaclesLayer,
  moveLayers: moveLayers
};

'use strict';

var turf = require('@turf/turf')

var obstacles = require('../../data/obstacles.json');

const types = ['wheelchair', 'sight'];
const levels = ['danger', 'problem'];
const slugs = ['active', 'alternate'];

var resetObstaclesLayer = function(map) {
  for (var t = 0; t < types.length; t++) {
    for (var l = 0; l < levels.length; l++) {
      for (var s = 0; s < slugs.length; s++) {
        var layerName = types[t] + '-' + levels[l] + '-' + slugs[s];
        if (map.getLayer(layerName)) {
          map.removeLayer(layerName);
        }
      }
    }
  }

  if (map.getSource('obstacles-active')) {
    map.removeSource('obstacles-active');
  }
  if (map.getSource('obstacles-alternate')) {
    map.removeSource('obstacles-alternate');
  }
}

var popup = new maplibregl.Popup().setMaxWidth('400px');

var plotAround = function(map, geojsonLine, slug) {
  var buffer = turf.buffer(geojsonLine, 0.005);

  for (var i = 0; i < obstacles.features.length; i++) {
    var o = obstacles.features[i];
    if (turf.booleanPointInPolygon(o.geometry.coordinates, buffer)) {
      o.properties.show = true;
    } else {
      delete o.properties.show;
    }
  }

  var obstaclesSource = 'obstacles' + '-' + slug;

  map.addSource(obstaclesSource, {
    'type': 'geojson',
    'data': obstacles
  });

  for (var t = 0; t < types.length; t++) {
    for (var l = 0; l < levels.length; l++) {
      map.addLayer({
        'id': types[t] + '-' + levels[l] + '-' + slug,
        'type': 'symbol',
        'source': obstaclesSource,
        'layout': {
          'icon-image': types[t] + '-' + levels[l],
          'icon-overlap': 'always'
        },
        'filter': ['all',
                   ['has', 'show'],
                   ['==', types[t], ['get', 'type']],
                   ['==', levels[l], ['get', 'level']]
                  ]
      });
    }
  }

  for (var t = 0; t < types.length; t++) {
    for (var l = 0; l < levels.length; l++) {
      var layerName = types[t] + '-' + levels[l] + '-' + slug;

      map.on('mouseenter', layerName, function (e) {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', layerName, function () {
        map.getCanvas().style.cursor = '';
      });

      map.on('click', layerName, function (e) {
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
  }
};

var moveLayers = function(map, slug) {
  for (var t = 0; t < types.length; t++) {
    for (var l = 0; l < levels.length; l++) {
      var layerName = types[t] + '-' + levels[l] + '-' + slug;
      if (map.getLayer(layerName)) {
        map.moveLayer(layerName);
      }
    }
  }
};

module.exports = {
  plotAround: plotAround,
  resetObstaclesLayer: resetObstaclesLayer,
  moveLayers: moveLayers
};

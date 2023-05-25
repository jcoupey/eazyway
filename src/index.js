'use strict';

var map = require('./config/map.js').map;
var routing = require('./utils/routing.js')
var poi = require('./static.js');

map.on('click', function(e) {
  if (!routing.hasStart()) {
    routing.setStart(map, e.lngLat);
  } else {
    if (!routing.hasEnd()) {
      routing.setEnd(map, e.lngLat);
    }
  }
});

map.on('load', function () {
  map.addSource('stadium', {
    'type': 'geojson',
    'data': poi.stadium
  });

  map.addLayer({
    'id': 'stadium',
    'type': 'circle',
    'source': 'stadium',
    'paint': {
      'circle-radius': 10,
      'circle-color': 'red',
      'circle-opacity': 0.7
    }
  });

  var popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  map.on('mouseenter', 'stadium', function (e) {
    map.getCanvas().style.cursor = 'pointer';

    var coordinates = e.features[0].geometry.coordinates.slice();
    var name = e.features[0].properties.name;

    // Ensure that if the map is zoomed out such that multiple copies
    // of the feature are visible, the popup appears over the copy
    // being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    popup.setLngLat(coordinates).setHTML(name).addTo(map);
  });

  map.on('mouseleave', 'stadium', function () {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

  map.addSource('hotels', {
    'type': 'geojson',
    'data': poi.hotels
  });

  map.addLayer({
    'id': 'hotels',
    'type': 'circle',
    'source': 'hotels',
    'paint': {
      'circle-radius': 8,
      'circle-color': 'green',
      'circle-opacity': 0.7
    }
  });

  map.on('mouseenter', 'hotels', function (e) {
    map.getCanvas().style.cursor = 'pointer';

    var coordinates = e.features[0].geometry.coordinates.slice();
    var name = e.features[0].properties.name;

    // Ensure that if the map is zoomed out such that multiple copies
    // of the feature are visible, the popup appears over the copy
    // being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    popup.setLngLat(coordinates).setHTML(name).addTo(map);
  });

  map.on('mouseenter', 'hotels', function () {
  });

  map.on('mouseleave', 'hotels', function () {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

});

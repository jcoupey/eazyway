'use strict';

var map = require('./config/map.js').map;
var geocoding = require('./utils/geocoding.js');
var routing = require('./utils/routing.js');
var urlHandler = require('./utils/url_handler.js');
var viewer = require('./utils/viewer.js');
var poi = require('./static.js');

var resizer = require('./resizer.js');

class logoControl {
  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl logo';
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

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
      'circle-stroke-color': 'black',
      'circle-stroke-width': 1,
      'circle-stroke-opacity': 1,
      'circle-radius': 10,
      'circle-color': '#fe0278',
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

  map.on('click', 'stadium', function (e) {
    e.originalEvent.preventDefault();

    routing.setEnd(map, poi.stadium.geometry.coordinates, true);
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
      'circle-stroke-color': 'black',
      'circle-stroke-width': 1,
      'circle-stroke-opacity': 1,
      'circle-radius': 8,
      'circle-color': '#ffac05',
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

  map.on('mouseleave', 'hotels', function () {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

  map.on('click', 'hotels', function (e) {
    e.originalEvent.preventDefault();

    var coordinates = e.features[0].geometry.coordinates.slice();

    routing.setStart(map, coordinates, true);
  });

  map.on('click', function(e) {
    if(!e.originalEvent.defaultPrevented) {
      if (!routing.hasStart()) {
        routing.setStart(map, e.lngLat, true);
      } else {
        if (!routing.hasEnd()) {
          routing.setEnd(map, e.lngLat, true);
        }
      }
    }
  });

  map.loadImage('img/danger.png', function(error, image) {
    if (error) throw error;
    map.addImage('danger', image);
  });

  var logo = new logoControl();
  map.addControl(logo, 'top-left');

  map.addControl(geocoding.start, 'top-left');
  geocoding.start.on('result', function(e) {
    routing.setStart(map, e.result.center, false);
  });

  map.addControl(geocoding.end, 'top-left');
  geocoding.end.on('result', function(e) {
    routing.setEnd(map, e.result.center, false);
  });

  // Hack to keep geocoding clear buttons always visible.
  geocoding.start.container
    .removeEventListener('mouseleave', geocoding.start._hideButton);
  geocoding.end.container
    .removeEventListener('mouseleave', geocoding.end._hideButton);

  // Remove routes and start/end markers on geocoder action.
  var hideButtons = document.getElementsByClassName('maplibregl-ctrl-geocoder--button');
  hideButtons[0].addEventListener('click', () => { routing.reset({start: true, end: false}); });
  hideButtons[1].addEventListener('click', () => { routing.reset({start: false, end: true}); });

  routing.setEnd(map, poi.stadium.geometry.coordinates, true);
});

viewer.init(map);

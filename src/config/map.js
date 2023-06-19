'use strict';

var style = require('../../data/style.json');

var map = new maplibregl.Map({
  container: 'map', // container id
  style: style,
  center: [2.34621, 48.81598], // starting position
  zoom: 13 // starting zoom
});

map.addControl(new maplibregl.NavigationControl());

module.exports = {
  map: map
};

'use strict';

const style = require('./style.js');

var map = new maplibregl.Map({
  container: 'map', // container id
  center: [2.34, 48.82], // starting position
  zoom: 14 // starting zoom
});

style.set(map);

map.addControl(new maplibregl.NavigationControl({showCompass: false}));

module.exports = {
  map: map
};

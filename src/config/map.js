'use strict';

const style = require('./style.js');

var map = new maplibregl.Map({
  container: 'map', // container id
  center: [2.34621, 48.81598], // starting position
  zoom: 13 // starting zoom
});

style.set(map);

map.addControl(new maplibregl.NavigationControl({showCompass: false}));

module.exports = {
  map: map
};

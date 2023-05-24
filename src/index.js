'use strict';

var map = require('./config/map.js').map;
var routing = require('./utils/routing.js')

map.on('click', function(e) {
  if (!routing.hasStart()) {
    routing.setStart(map, e.lngLat);
  } else {
    if (!routing.hasEnd()) {
      routing.setEnd(map, e.lngLat);
    }
  }
});

'use strict';

var osrm = require('./osrm.js')

var start;
var end;

var hasStart = function() {
  return start != undefined;
}

var hasEnd = function() {
  return end != undefined;
}

var setStart = function(map, lngLat) {
  start = new maplibregl.Marker({
    draggable: true,
    color: 'green'
  })
    .setLngLat(lngLat)
    .addTo(map);

  start.on('dragend', () => { getRoutes(map); });
}

var setEnd = function(map, lngLat) {
  end = new maplibregl.Marker({
    draggable: true,
    color: 'red'
  })
    .setLngLat(lngLat)
    .addTo(map);

  end.on('dragend', () => { getRoutes(map); });

  getRoutes(map);
}

var getRoutes = function(map) {
  if (start && end) {
    osrm.route(map, [start.getLngLat(), end.getLngLat()]);
  }
}

module.exports = {
  hasStart: hasStart,
  hasEnd: hasEnd,
  setStart: setStart,
  setEnd: setEnd
}

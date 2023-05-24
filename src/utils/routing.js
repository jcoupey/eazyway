'use strict';

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

  start.on('dragend', () => { route(); });
}

var setEnd = function(map, lngLat) {
  end = new maplibregl.Marker({
    draggable: true,
    color: 'red'
  })
    .setLngLat(lngLat)
    .addTo(map);

  end.on('dragend', () => { route(); });

  route();
}

var route = function() {
  console.log("route");
}

module.exports = {
  hasStart: hasStart,
  hasEnd: hasEnd,
  setStart: setStart,
  setEnd: setEnd
}

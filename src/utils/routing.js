'use strict';

var osrm = require('./osrm.js');

var start;
var end;

var hasStart = function() {
  return start != undefined;
};

var hasEnd = function() {
  return end != undefined;
};

var setStart = function(map, lngLat) {
  if (start) {
    start.remove();
  }

  start = new maplibregl.Marker({
    draggable: true,
    color: 'green'
  })
    .setLngLat(lngLat)
    .addTo(map);

  start.on('dragend', function(e) {
    setStartAddress(e.target.getLngLat());
    getRoutes(map);
  });

  if (!hasStartAddress()) {
    setStartAddress(lngLat);
  }
  getRoutes(map);
};

var setEnd = function(map, lngLat) {
  if (end) {
    end.remove();
  }

  end = new maplibregl.Marker({
    draggable: true,
    color: '#d02601'
  })
    .setLngLat(lngLat)
    .addTo(map);

  end.on('dragend', function(e) {
    setEndAddress(e.target.getLngLat());
    getRoutes(map);
  });

  if (!hasEndAddress()) {
    setEndAddress(lngLat);
  }
  getRoutes(map);
};

var getRoutes = function(map) {
  if (start && end) {
    osrm.route(map, start.getLngLat(), end.getLngLat());
  }
};

var hasStartAddress = function() {
  return document.getElementsByClassName('mapboxgl-ctrl-geocoder--input')[0].textLength != 0;
};

var hasEndAddress = function() {
  return document.getElementsByClassName('mapboxgl-ctrl-geocoder--input')[1].textLength != 0;
};

var setStartAddress = async (lngLat) => {
  try {
    let request =
        'https://nominatim.openstreetmap.org/reverse.php?lat=' + lngLat.lat +
        '&lon=' + lngLat.lng +
        '&format=geojson';
    const response = await fetch(request);
    const geojson = await response.json();

    document.getElementsByClassName('mapboxgl-ctrl-geocoder--input')[0].value
      = geojson.features[0].properties.display_name;
  } catch (e) {
    console.error(`Failed to reverse geocode with error: ${e}`);
  }
};

var setEndAddress = async (lngLat) => {
  try {
    let request =
        'https://nominatim.openstreetmap.org/reverse.php?lat=' + lngLat.lat +
        '&lon=' + lngLat.lng +
        '&format=geojson';
    const response = await fetch(request);
    const geojson = await response.json();

    document.getElementsByClassName('mapboxgl-ctrl-geocoder--input')[1].value
      = geojson.features[0].properties.display_name;
  } catch (e) {
    console.error(`Failed to reverse geocode with error: ${e}`);
  }
};

module.exports = {
  hasStart: hasStart,
  hasEnd: hasEnd,
  setStart: setStart,
  setEnd: setEnd
};

'use strict';

var osrm = require('./osrm.js');
var geocoding = require('./geocoding.js');

var start;
var end;

var hasStart = function() {
  return start != undefined;
};

var hasEnd = function() {
  return end != undefined;
};

var setStart = function(map, lngLat, updateAddress) {
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

  if (updateAddress) {
    setStartAddress(lngLat);
  }
  getRoutes(map);
};

var setEnd = function(map, lngLat, updateAddress) {
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

  if (updateAddress) {
    setEndAddress(lngLat);
  }
  getRoutes(map);
};

var getRoutes = function(map) {
  if (start && end) {
    osrm.route(map, start.getLngLat(), end.getLngLat());
  }
};

var setStartAddress = async (lngLat) => {
  try {
    const name = await geocoding.reverseName(lngLat);

    document.getElementsByClassName('mapboxgl-ctrl-geocoder--input')[0].value = name;
  } catch (e) {
    console.error(`Failed to reverse geocode with error: ${e}`);
  }
};

var setEndAddress = async (lngLat) => {
  try {
    const name = await geocoding.reverseName(lngLat);

    document.getElementsByClassName('mapboxgl-ctrl-geocoder--input')[1].value = name;
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

'use strict';

var osrm = require('./osrm.js');
var geocoding = require('./geocoding.js');
var viewer = require('./viewer.js');

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
    color: '#ffac05'
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

  geocoding.start._clearEl.style.display = "block"

  getRoutes(map);
};

var setEnd = function(map, lngLat, updateAddress) {
  if (end) {
    end.remove();
  }

  end = new maplibregl.Marker({
    draggable: true,
    color: '#fe0278'
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

  geocoding.end._clearEl.style.display = "block"

  getRoutes(map);
};

var getRoutes = function(map) {
  if (start && end) {
    var mapDiv = document.getElementById('map');
    var fullWidth = document.getElementById('full-page').offsetWidth;
    var resizeWidth = document.getElementById('dragMe').offsetWidth;
    var mapWidth = mapDiv.offsetWidth;
    if (fullWidth == mapWidth + resizeWidth) {
      mapDiv.style.width = '70%';
      viewer.resize();
    }
    osrm.route(map, start.getLngLat(), end.getLngLat());
  }
};

var reset = function(options) {
  if (options.start) {
    start.remove();
    start = undefined;
  }
  if (options.end) {
    end.remove();
    end = undefined;
  }

  osrm.reset();
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
  reset: reset,
  hasStart: hasStart,
  hasEnd: hasEnd,
  setStart: setStart,
  setEnd: setEnd
};

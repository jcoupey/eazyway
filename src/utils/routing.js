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

const geocoder_api = {
  forwardGeocode: async (config) => {
    const features = [];
    try {
      let request =
          'https://nominatim.openstreetmap.org/search?q=' +
          config.query +
          '&viewbox=' + config.bbox.join(',') +
          '&bounded=1' +
          '&format=geojson&polygon_geojson=1&addressdetails=1';
      const response = await fetch(request);
      const geojson = await response.json();
      for (let feature of geojson.features) {
        let center = [
          feature.bbox[0] +
            (feature.bbox[2] - feature.bbox[0]) / 2,
          feature.bbox[1] +
            (feature.bbox[3] - feature.bbox[1]) / 2
        ];
        let point = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: center
          },
          place_name: feature.properties.display_name,
          properties: feature.properties,
          text: feature.properties.display_name,
          place_type: ['place'],
          center: center
        };
        features.push(point);
      }
    } catch (e) {
      console.error(`Failed to forwardGeocode with error: ${e}`);
    }

    return {
      features: features
    };
  }
};

const startGeocoder = new MaplibreGeocoder(geocoder_api, {
  placeholder: 'Start',
  marker: false,
  limit: 3,
  bbox: [2.31293, 48.80223, 2.37949, 48.82973],
  showResultsWhileTyping: true,
  minLength: 3,
  flyTo: false
});

const endGeocoder = new MaplibreGeocoder(geocoder_api, {
  placeholder: 'End',
  marker: false,
  limit: 3,
  bbox: [2.31293, 48.80223, 2.37949, 48.82973],
  showResultsWhileTyping: true,
  minLength: 3,
  flyTo: false
});

var init = function(map) {
  map.addControl(startGeocoder, 'top-left');
  startGeocoder.on('result', function(e) {
    setStart(map, e.result.center);
  });

 map.addControl(endGeocoder, 'top-left');
  endGeocoder.on('result', function(e) {
    setEnd(map, e.result.center);
  });
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
  setEnd: setEnd,
  init: init
};

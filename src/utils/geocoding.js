'use strict';

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

const start = new MaplibreGeocoder(geocoder_api, {
  placeholder: 'Start',
  marker: false,
  limit: 3,
  bbox: [2.31293, 48.80223, 2.37949, 48.82973],
  showResultsWhileTyping: true,
  minLength: 3,
  flyTo: false
});

const end = new MaplibreGeocoder(geocoder_api, {
  placeholder: 'End',
  marker: false,
  limit: 3,
  bbox: [2.31293, 48.80223, 2.37949, 48.82973],
  showResultsWhileTyping: true,
  minLength: 3,
  flyTo: false
});

var reverseName = async (lngLat) => {
  let request =
      'https://nominatim.openstreetmap.org/reverse.php?lat=' + lngLat.lat +
      '&lon=' + lngLat.lng +
      '&format=geojson';
  const response = await fetch(request);
  const geojson = await response.json();

  return geojson.features[0].properties.display_name;
};

module.exports = {
  start: start,
  end: end,
  reverseName: reverseName
};

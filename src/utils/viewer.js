'use strict';

var {Viewer} = mapillary;

var ACCESS_TOKEN = "MLY|XXX";

var mjs;

var setMarker = function(map, img) {
  var imgPoint = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'Point',
      'coordinates': [img.originalLngLat.lng, img.originalLngLat.lat]
    }
  };

  if (!map.getSource('mapillary-marker')) {
    map.addSource('mapillary-marker', {
      'type': 'geojson',
      'data': imgPoint
    });
  } else {
    map.getSource('mapillary-marker').setData(imgPoint);
  }

  if (!map.getLayer('mapillary-marker')) {
    map.addLayer({
      'id': 'mapillary-marker',
      'type': 'circle',
      'source': 'mapillary-marker',
      'paint': {
        'circle-stroke-color': 'white',
        'circle-stroke-width': 2,
        'circle-stroke-opacity': 1,
        'circle-radius': 8,
        'circle-color': 'orange',
        'circle-opacity': 1
      }
    });
  }
  map.moveLayer('mapillary-marker');
}

var init = function(map) {
  mjs = new Viewer({
    accessToken: ACCESS_TOKEN,
    container: 'mjs',
    component: { cover: false }
  });

  mjs.on("moveend", function() {
    mjs.getImage().then(function(img) {
      setMarker(map, img);
    });
  });
}

var setCurrentImage = function(id) {
  var container = document.getElementById("mjs");
  container.style.width = "400px";
  container.style.height = "400px";

  mjs.moveTo(id);
}

module.exports = {
  init: init,
  setCurrentImage: setCurrentImage
};

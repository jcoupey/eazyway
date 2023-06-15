'use strict';

var {Viewer} = mapillary;

var ACCESS_TOKEN = "MLY|XXX";

var mjs;

var imageMarker;

var updateMarker = function(map, img) {
  imageMarker.setLngLat([img.originalLngLat.lng, img.originalLngLat.lat]);
  imageMarker.addTo(map);
}

var init = function(map) {
  mjs = new Viewer({
    accessToken: ACCESS_TOKEN,
    container: 'mjs',
    component: { cover: false }
  });

  const img = document.createElement("img");
  img.src = 'img/image_marker.svg';

  imageMarker = new maplibregl.Marker({
    element: img
  });

  mjs.on("image", function() {
    mjs.getImage().then(function(img) {
      updateMarker(map, img);
    });
  });

  mjs.on("bearing", function() {
    mjs.getBearing().then(function(bearing) {
      imageMarker.setRotation(bearing);
    });
  });
}

var setCurrentImage = function(id) {
  mjs.moveTo(id);
}

var filterImages = function(ids) {
  mjs.setFilter(['in', 'id', ...ids]);
}

module.exports = {
  init: init,
  filterImages: filterImages,
  setCurrentImage: setCurrentImage
};

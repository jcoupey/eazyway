'use strict';

var {Viewer} = mapillary;

const ACCESS_TOKEN  = require('../../data/mly_token.json');

var map;
var mjs;

var imageMarker;

var firstImageLoad = true;

var updateMarker = function(img) {
  var coords = [img.originalLngLat.lng, img.originalLngLat.lat];

  if(!firstImageLoad) {
    map.easeTo({
      center: coords
    });
  }

  imageMarker.setLngLat(coords);
  imageMarker.addTo(map);
};

var init = function(m) {
  map = m;
  mjs = new Viewer({
    accessToken: ACCESS_TOKEN,
    container: 'mjs',
    component: {
      cover: false,
      sequence: {
        visible: false
      }
    }
  });

  const img = document.createElement("img");
  img.src = 'img/image_marker.svg';

  imageMarker = new maplibregl.Marker({
    element: img
  });

  mjs.on("image", function() {
    mjs.getImage().then(function(img) {
      updateMarker(img);
      firstImageLoad = false;
    });
  });

  mjs.on("bearing", function() {
    mjs.getBearing().then(function(bearing) {
      imageMarker.setRotation(bearing);
    });
  });
};

var setCurrentImage = function(id) {
  mjs.moveTo(id).then(
    // Required in case of route update with the same first image in
    // which case the 'image' event is not triggered by moveTo.
    () => {imageMarker.addTo(map);}
  );
};

var filterImages = function(ids) {
  mjs.setFilter(['in', 'id', ...ids]);
};

var reset = function() {
  imageMarker.remove();
  firstImageLoad = true;
};

var resize = function() {
  if (mjs) {
    mjs.resize();
  }
};

module.exports = {
  init: init,
  filterImages: filterImages,
  reset: reset,
  resize: resize,
  setCurrentImage: setCurrentImage
};

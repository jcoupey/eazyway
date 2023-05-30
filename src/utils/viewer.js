'use strict';

var {Viewer} = mapillary;

var ACCESS_TOKEN = "MLY|XXX";

var mjs;

var init = function() {
  mjs = new Viewer({
    accessToken: ACCESS_TOKEN,
    container: 'mjs',
    component: { cover: false }
  });

  var container = document.getElementById("mjs");
  container.style.width = "400px";
  container.style.height = "400px";
}

var setCurrentImage = function(id) {
  mjs.moveTo(id);
}

module.exports = {
  init: init,
  setCurrentImage: setCurrentImage
};

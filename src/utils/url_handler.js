'use strict';

var getLoc = function(key) {
  var loc;

  const urlParams = new URLSearchParams(window.location.search);

  var param = urlParams.get(key);
  if (param) {
    var coordinates = param.split(',')

    if (coordinates.length === 2) {
      var lng = parseFloat(coordinates[0]);
      var lat = parseFloat(coordinates[1]);

      if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
        loc = {
          lng: lng,
          lat: parseFloat(coordinates[1])
        }
      }
    }
  }

  return loc;
}

var reset = function(key) {
  var urlParams = new URLSearchParams(window.location.search);

  urlParams.delete(key);

  const paramStr = urlParams.toString();

  if (paramStr.length > 0) {
    window.history.replaceState(null, document.title, '/?' + paramStr);
  } else {
    window.history.replaceState(null, document.title, '/');
  }
};

var set = function(key, value) {
  const urlParams = new URLSearchParams(window.location.search);

  urlParams.set(key, value);

  window.history.replaceState(null, document.title, '/?' + urlParams.toString());
};

module.exports = {
  getLoc: getLoc,
  reset: reset,
  set: set
};

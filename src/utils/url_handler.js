'use strict';

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
  reset: reset,
  set: set
};

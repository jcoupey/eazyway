'use strict';

var map = new maplibregl.Map({
  container: 'map', // container id
  style: 'https://vecto.teritorio.xyz/styles/basic/style.json?key=your_key',
  center: [2.34621, 48.81598], // starting position
  zoom: 13 // starting zoom
});

module.exports = {
  map: map
};

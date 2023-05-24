'use strict';

var map = new maplibregl.Map({
  container: 'map', // container id
  style: {
    'version': 8,
    'sources': {
      'raster-tiles': {
        'type': 'raster',
        'tiles': [
          'https://a.forte.tiles.quaidorsay.fr/fr/{z}/{x}/{y}.png'
        ],
        'tileSize': 256,
        'attribution':
        'Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a> - tiles <a target="_top" rel="noopener" href="https://github.com/tilery/pianoforte">Min. Aff. Étrangères</a>'
      }
    },
    'layers': [
      {
        'id': 'simple-tiles',
        'type': 'raster',
        'source': 'raster-tiles',
        'minzoom': 0,
        'maxzoom': 22
      }
    ]
  },
  center: [2.34621, 48.81598], // starting position
  zoom: 14 // starting zoom
});

module.exports = {
  map: map
}

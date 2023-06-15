'use strict';

var polyline = require('@mapbox/polyline');

var images = require('./images.js');
var obstacles = require('./obstacles.js');

var routeOptions = '?alternatives=true&overview=full';

var getRouteRequest = function(start, end) {
  var address = 'https://eazyway.verso-optim.com/route/v1/driving/';

  address += start.lng + ',' + start.lat + ';';
  address += end.lng + ',' + end.lat;

  address += routeOptions;

  return address;
};

var getGeojsonLine = function(route) {
  var latLngs = polyline.decode(route['geometry']);

  var data = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'LineString',
      'coordinates': [
      ]
    }
  };

  for (var i = 0; i < latLngs.length; i++) {
    data.geometry.coordinates.push([latLngs[i][1], latLngs[i][0]]);
  }

  return data;
};

var maxAlternatives = 2;
const routeStyle = [
  {
    color: '#6fa8dc',
    opacity: 1,
    width: 6,
    outline: {
      color: '#0b5394',
      opacity: 1,
      width: 10
    }
  },
  {
    color: '#efd3b6',
    opacity: 0.6,
    width: 6,
    outline: {
      color: '#da8021',
      opacity: 1,
      width: 10
    }
  }
]

var cleanRoutes = function(map) {
  for (var i = 0; i < maxAlternatives; i++) {
    var name = 'route-' + i.toString();
    if (map.getLayer(name)) {
      map.removeLayer(name);
    }
    if (map.getLayer(name + '-outline')) {
      map.removeLayer(name + '-outline');
    }
    if (map.getSource(name)) {
      map.removeSource(name);
    }
  }
};

var routes = [];

var plotRoutes = function(map, start, end) {
  cleanRoutes(map);

  var routeBounds = new maplibregl.LngLatBounds(
    [Math.min(start.lng, end.lng), Math.min(start.lat, end.lat)],
    [Math.max(start.lng, end.lng), Math.max(start.lat, end.lat)]
  );

  var nbRoutes =  Math.min(maxAlternatives, routes.length);
  for (var rev_i = 0; rev_i < nbRoutes; rev_i++) {
    var i = nbRoutes - rev_i - 1;
    var route = routes[i];
    var name = 'route-' + i.toString();

    var geojsonLine = getGeojsonLine(route);
    map.addSource(name, {
      'type': 'geojson',
      'data': geojsonLine
    });

    var coordinates = geojsonLine.geometry.coordinates;
    routeBounds = coordinates.reduce(function (bounds, coord) {
      return bounds.extend(coord);
    }, routeBounds);

    map.addLayer({
      'id': name + '-outline',
      'type': 'line',
      'source': name,
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': routeStyle[i].outline.color,
        'line-width': routeStyle[i].outline.width,
        'line-opacity': routeStyle[i].outline.opacity
      }
    });

    map.addLayer({
      'id': name,
      'type': 'line',
      'source': name,
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': routeStyle[i].color,
        'line-width': routeStyle[i].width,
        'line-opacity': routeStyle[i].opacity
      }
    });

    if (i === 0) {
      images.plotAround(map, geojsonLine, start);
      obstacles.plotAround(map, geojsonLine);
    }
  }

  map.fitBounds(routeBounds, {
    padding: 20
  });
};

var route = function(map, start, end) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4) {
      if (xhttp.status !== 200) {
        console.log('Error: ' + xhttp.status);
      }
      else{
        routes = JSON.parse(xhttp.response).routes;

        plotRoutes(map, start, end);
      }
    }
  };

  xhttp.open('GET', getRouteRequest(start, end));
  xhttp.send();
};

module.exports = {
  route: route
};

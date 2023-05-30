'use strict';

var polyline = require('@mapbox/polyline');

var images = require('./images.js');

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
var routeColors = ['blue', 'grey'];

var cleanRoutes = function(map) {
  for (var i = 0; i < maxAlternatives; i++) {
    var name = 'route-' + i.toString();
    if (map.getLayer(name)) {
      map.removeLayer(name);
    }
    if (map.getSource(name)) {
      map.removeSource(name);
    }
  }
};

var route = function(map, start, end) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4) {
      if (xhttp.status !== 200) {
        console.log('Error: ' + xhttp.status);
      }
      else{
        var result = JSON.parse(xhttp.response);

        cleanRoutes(map);

        var routeBounds = new maplibregl.LngLatBounds(
          [Math.min(start.lng, end.lng), Math.min(start.lat, end.lat)],
          [Math.max(start.lng, end.lng), Math.max(start.lat, end.lat)]
        );

        for (var i = 0; i < Math.min(maxAlternatives, result.routes.length); i++) {
          var route = result.routes[i];
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
            'id': name,
            'type': 'line',
            'source': name,
            'layout': {
              'line-join': 'round',
              'line-cap': 'round'
            },
            'paint': {
              'line-color': routeColors[i],
              'line-width': 11,
              'line-opacity': 0.65
            }
          });

          if (i === 0) {
            images.plotAround(map, geojsonLine, start);
          } else {
            map.moveLayer(name, 'route-0');
          }
        }

        map.fitBounds(routeBounds, {
          padding: 20
        });
      }
    }
  };

  xhttp.open('GET', getRouteRequest(start, end));
  xhttp.send();
};

module.exports = {
  route: route
};

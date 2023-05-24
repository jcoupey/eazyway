'use strict';

var polyline = require('@mapbox/polyline');

var routeOptions = '?alternatives=true&overview=full';

var getRouteRequest = function(coords) {
  var address = 'https://eazyway.verso-optim.com/route/v1/driving/';

  for (var i = 0; i < coords.length; i++) {
    address += coords[i].lng + ',' + coords[i].lat + ';';
  }
  return address.slice(0, -1) + routeOptions;
}

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
  }

  for (var i = 0; i < latLngs.length; i++) {
    data.geometry.coordinates.push([latLngs[i][1], latLngs[i][0]]);
  }

  return data;
}

var route = function(map, coords) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4) {
      if (xhttp.status !== 200) {
        console.log('Error: ' + xhttp.status);
      }
      else{
        var result = JSON.parse(xhttp.response);

        var route = result.routes[0];

        map.addSource('route', {
          'type': 'geojson',
          'data': getGeojsonLine(route)
        });

        map.addLayer({
          'id': 'route',
          'type': 'line',
          'source': 'route',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': 'blue',
            'line-width': 6
          }
        });
      }
    }
  };

  xhttp.open('GET', getRouteRequest(coords));
  xhttp.send();
}

module.exports = {
  route: route
}

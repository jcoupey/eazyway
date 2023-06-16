'use strict';

var polyline = require('@mapbox/polyline');

var images = require('./images.js');
var obstacles = require('./obstacles.js');

var routeOptions = '?alternatives=true&overview=full';

var map;
var start;
var end;

var getRouteRequest = function() {
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

var middlePoint = function(geojsonLine) {
  var coords = geojsonLine.geometry.coordinates;

  return coords[Math.round(coords.length / 2)];
}

var routes = [];
var distancePopup = new maplibregl.Popup();

var displayDistance = function(route) {
  var distance = route.distance;
  var distanceStr;

  if (distance < 1000) {
    distanceStr = Math.round(distance) + ' m';
  } else {
    var km = distance / 1000;
    distanceStr = Math.round((km + Number.EPSILON) * 10) / 10 + ' km';
  }

  return distanceStr;
}

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

const routeNames = ['main', 'alternate'];

var cleanRoutes = function() {
  distancePopup.remove();

  routeNames.forEach(name => {
    if (map.getLayer(name)) {
      map.removeLayer(name);
    }
    if (map.getLayer(name + '-outline')) {
      map.removeLayer(name + '-outline');
    }
    if (map.getSource(name)) {
      map.removeSource(name);
    }
  });
};

var plotRoute = function(name, geojsonLine, style) {
  map.addSource(name, {
    'type': 'geojson',
    'data': geojsonLine
  });

  map.addLayer({
    'id': name + '-outline',
    'type': 'line',
    'source': name,
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': style.outline.color,
      'line-width': style.outline.width,
      'line-opacity': style.outline.opacity
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
      'line-color': style.color,
      'line-width': style.width,
      'line-opacity': style.opacity
    }
  });
};

var plotRoutes = function() {
  cleanRoutes();

  var routeBounds = new maplibregl.LngLatBounds(
    [Math.min(start.lng, end.lng), Math.min(start.lat, end.lat)],
    [Math.max(start.lng, end.lng), Math.max(start.lat, end.lat)]
  );

  var nbRoutes =  Math.min(routes.length, 2);

  var geojsonLines = [];
  for (var i = 0; i < nbRoutes; i++) {
    var geojsonLine = getGeojsonLine(routes[i]);

    var coordinates = geojsonLine.geometry.coordinates;
    routeBounds = coordinates.reduce(function (bounds, coord) {
      return bounds.extend(coord);
    }, routeBounds);

    geojsonLines.push(geojsonLine);
  }

  if (nbRoutes > 1) {
    plotRoute('alternate', geojsonLines[1], routeStyle[1]);
  }

  plotRoute('main', geojsonLines[0], routeStyle[0]);

  images.plotAround(map, geojsonLines[0], start);
  obstacles.plotAround(map, geojsonLines[0]);

  distancePopup
    .setLngLat(middlePoint(geojsonLines[0]))
    .setHTML(displayDistance(routes[0]))
    .addTo(map);

  map.fitBounds(routeBounds, {
    padding: 20
  });
};

  // var alternativeLayer = 'route-1-outline';
  // if (map.getLayer(alternativeLayer)) {
  //   map.on('click', alternativeLayer, function(e) {
  //     [routes[0], routes[1]] = [routes[1], routes[0]];
  //     plotRoutes();
  //   });
  // }

var route = function(m, s, e) {
  map = m;
  start = s;
  end = e;

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4) {
      if (xhttp.status !== 200) {
        console.log('Error: ' + xhttp.status);
      }
      else{
        routes = JSON.parse(xhttp.response).routes;

        plotRoutes();
      }
    }
  };

  xhttp.open('GET', getRouteRequest());
  xhttp.send();
};

module.exports = {
  route: route
};

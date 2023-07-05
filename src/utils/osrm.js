'use strict';

var polyline = require('@mapbox/polyline');

var images = require('./images.js');
var obstacles = require('./obstacles.js');

var routeOptions = '?alternatives=true&overview=full';

var map;
var start;
var end;
var switchRoutes = false;

const routeStyle = {
  active: {
    color: '#571cb5',
    opacity: 1,
    width: 6,
    outline: {
      color: '#2e0a45',
      opacity: 1,
      width: 10
    }
  },
  alternate: {
    color: '#ffac05',
    opacity: 1,
    width: 6,
    outline: {
      color: '#da8021',
      opacity: 1,
      width: 10
    }
  }
};

var getRouteRequest = function() {
  var address = 'https://demo.eazyway.org/route/v1/driving/';

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

var removeLayerAndSource = function(name) {
  if (map.getLayer(name)) {
    map.removeLayer(name);
  }
  if (map.getSource(name)) {
    map.removeSource(name);
  }
};

var showStart = function() {
  removeLayerAndSource('start');

  var snapped = geojsonLines[0].geometry.coordinates[0];

  var startLine = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'LineString',
      'coordinates': [
        [start.lng, start.lat],
        snapped
      ]
    }
  };

  map.addSource('start', {
    'type': 'geojson',
    'data': startLine
  });

  map.addLayer({
    'id': 'start',
    'type': 'line',
    'source': 'start',
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': routeStyle.active.color,
      'line-width': 5,
      'line-opacity': 1,
      'line-dasharray': [1, 2]
    }
  });
};

var showEnd = function() {
  removeLayerAndSource('end');

  var routeCoords = geojsonLines[0].geometry.coordinates;
  var snapped = routeCoords[routeCoords.length - 1];

  var endLine = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'LineString',
      'coordinates': [
        snapped,
        [end.lng, end.lat],
      ]
    }
  };

  map.addSource('end', {
    'type': 'geojson',
    'data': endLine
  });

  map.addLayer({
    'id': 'end',
    'type': 'line',
    'source': 'end',
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': routeStyle.active.color,
      'line-width': 5,
      'line-opacity': 1,
      'line-dasharray': [1, 2]
    }
  });
};

var middlePoint = function(geojsonLine) {
  var coords = geojsonLine.geometry.coordinates;

  return coords[Math.round(coords.length / 2)];
};

var routes = [];
var geojsonLines = [];
var routeBounds;
var distancePopup;
var alternateDistancePopup;

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
};

const routeNames = ['active', 'alternate'];

var cleanRoutes = function() {
  if (distancePopup) {
    distancePopup.remove();
  }
  if (alternateDistancePopup) {
    alternateDistancePopup.remove();
  }

  removeLayerAndSource('start');
  removeLayerAndSource('end');

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
  reset();

  var activeIndex = 0;
  var alternateIndex = 1;
  var hasAlternate = (routes.length == 2);

  if (hasAlternate && switchRoutes) {
    activeIndex = 1;
    alternateIndex = 0;
  }

  if (hasAlternate) {
    plotRoute('alternate',
              geojsonLines[alternateIndex],
              routeStyle.alternate);

    alternateDistancePopup = new maplibregl.Popup()
      .setLngLat(middlePoint(geojsonLines[alternateIndex]))
      .setHTML(displayDistance(routes[alternateIndex]))
      .addTo(map);
  }

  plotRoute('active',
            geojsonLines[activeIndex],
            routeStyle.active);

  distancePopup = new maplibregl.Popup()
    .setLngLat(middlePoint(geojsonLines[activeIndex]))
    .setHTML(displayDistance(routes[activeIndex]))
    .addTo(map);

  const defaultPadding = 30;
  var topPadding = 50;
  var geocoderDivs = document.getElementsByClassName('maplibregl-ctrl-geocoder');
  for (var i = 0; i < geocoderDivs.length; ++i) {
    topPadding += geocoderDivs[i].clientHeight;
  }
  topPadding += document.getElementsByClassName('logo')[0].clientHeight;

  map.fitBounds(routeBounds, {
    padding: {
      top: topPadding,
      bottom: defaultPadding,
      left: defaultPadding,
      right: defaultPadding
    }
  });

  // Will register obstacles click events first to ease propagation
  // stopping.
  obstacles.plotAround(map, geojsonLines[activeIndex], 'active');
  if (hasAlternate) {
    obstacles.plotAround(map, geojsonLines[1 - activeIndex], 'alternate');
  }

  images.plotAround(map, geojsonLines[activeIndex], start);

  if (hasAlternate) {
    obstacles.moveLayers(map, 'alternate');
  }
  obstacles.moveLayers(map, 'active');

  map.on('click', 'active', function(e) {
    if(!e.originalEvent.defaultPrevented) {
      e.originalEvent.preventDefault();
    }
  });

  map.on('click', 'active-outline', function(e) {
    if(!e.originalEvent.defaultPrevented) {
      e.originalEvent.preventDefault();
    }
  });

  if (hasAlternate) {
    map.on('click', 'alternate-outline', function(e) {
      if(!e.originalEvent.defaultPrevented) {
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();

        switchRoutes = !switchRoutes;
        plotRoutes();
      }
    });

    map.on('mouseenter', 'alternate-outline', function () {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'alternate-outline', function () {
      map.getCanvas().style.cursor = '';
    });
  }
};

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

        routeBounds = new maplibregl.LngLatBounds(
          [Math.min(start.lng, end.lng), Math.min(start.lat, end.lat)],
          [Math.max(start.lng, end.lng), Math.max(start.lat, end.lat)]
        );

        var nbRoutes =  Math.min(routes.length, 2);

        geojsonLines = [];

        for (var i = 0; i < nbRoutes; i++) {
          var geojsonLine = getGeojsonLine(routes[i]);

          var coordinates = geojsonLine.geometry.coordinates;
          routeBounds = coordinates.reduce(function (bounds, coord) {
            return bounds.extend(coord);
          }, routeBounds);

          geojsonLines.push(geojsonLine);
        }

        plotRoutes();

        showStart();
        showEnd();
      }
    }
  };

  xhttp.open('GET', getRouteRequest());
  xhttp.send();
};

var reset = function() {
  if (map) {
    // Otherwise no routing request has been set previously and there
    // is nothing to clear.
    cleanRoutes();

    images.resetImagesLayer(map);
    obstacles.resetObstaclesLayer(map);
  }
};

module.exports = {
  reset: reset,
  route: route
};

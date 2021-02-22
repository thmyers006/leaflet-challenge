
// Define streetmap and darkmap layers
var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
});

var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
});

// Creating map object
var myMap = L.map("map", {
  center: [39.828, -98.579],
  zoom: 3,
  layers: [streetmap, darkmap]

});
// Adding single tile layer to the map for initiation
streetmap.addTo(myMap);


// Store API query variable
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

// Grab the data with d3
// Perform a GET request to the query URL
d3.json(url, function (data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log(data.features);
});

// create function to create popups from data retrieved from geoJSON 
function onEachFeature(feature, layer) {
  layer.bindPopup("<h3>" + feature.properties.place +
    "</h4><hr><p>" + new Date(feature.properties.time) + "</p>" + "Depth : " + feature.geometry.coordinates[2] + 
    " Magnitude : " + feature.properties.mag);
}

// create function to differentiate altitude of earthquake by color of circle
function getColor(depth) {
  //console.log(depth);
  if (depth > 150) {
    return "#7b057d"
  }
  else if (depth > 120) {
    return "#e174e3"
  }
  else if (depth > 90) {
    return "#5b76f0"
  }
  else if (depth > 60) {
    return "#9dabed"
  }
  else if (depth > 30) {
    return "#ede609"
  }
  else if (depth > 0) {
    return "#f5f187"
  }
  else {
    return "#b8b7a5"
  }
}

//create function to format markers for earthquakes
function style(feature) {
  return {
    "color": "#000000",
    "weight": 1,
    "opacity": 0.90,
    "radius": feature.properties.mag * 2,
    "fillColor": getColor(feature.geometry.coordinates[2])
  };
}


function createMap(earthquakes) {

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}

// Create legend

var legend = L.control({position: "bottomleft"});
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
    //console.log(limits);
  var grades = [-10, 0, 30, 60, 90, 120, 150];   
  var colors = ["#b8b7a5", "#f5f187", "#ede609", "#9dabed", "#5b76f0", "#e174e3", "#7b057d"];
  var labels = [];

  // Add min and max
  var legendInfo = "<h2>Earthquake Depth</h2>" + "<div class=\"labels\">" + 
                  "<div class=\"min\">" + grades[0] + "</div>" +
                  "<div class=\"max\">" + grades[grades.length - 1] + "</div>" +
                  "</div>";
  div.innerHTML = legendInfo;
  grades.forEach(function(limit, index) {
    labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
  });
  div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
};

// Adding legend to the map
legend.addTo(myMap);


function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake


  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      //console.log(latlng);
      return L.circleMarker(latlng);
    },
    style: style
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);

};

// map background
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  maxZoom: 15,
  id: "light-v10",
  accessToken: API_KEY
});
//fault line layer
var faultLines = new L.LayerGroup();
var map_2 = "data/PB2002_plates.json";
d3.json(map_2, function(data) {
  L.geoJSON(data, {
    style: function() {
      return {color: "brown", fillOpacity: 0}
    }
  }).addTo(faultLines) 
});

// query geojson data
var map_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
// color based on magnitude
function chooseColor(mag) {

    if (mag>=5){return "#ff0400";}
    if (mag>=4){return "#ff0400";}
    if (mag>=3){return "#ff8400";}
    if (mag>=2){return "#fff700";}
    if (mag>=1){return "#d0ff00";}
    else{return "#58ff00";}
  }

// Red, orange, yellow, lightgreen, green
function displayLegend(){
    var legendColorLabel = [{
        label: "0-1",
        color: "#58ff00"
    },
    {
        label: "1-2",
        color: "#fff700"
    },{
       
        label:"3-4",
        color:"#ff8400"
    },
    {
        label:"4-5",
        color:"#ff0400"
    },
    {
        label:"5+",
        color:"#880505  "
    }];

    var color_string = "";
    for (i = 0; i < legendColorLabel.length; i++){
=       color_string += "<p style = \"color: "+legendColorLabel[i].color + "\">"+legendColorLabel[i].label+"</p> ";
    }
    return color_string;
  }

  // query api
  d3.json(map_url, function(data) {
      // create features with json response
      createFeatures(data.features);
  });

  function createFeatures(data) {
    function onEachLayer(feature) {
        return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
          radius: feature.properties.mag*5,
          fillOpacity: 0.5,
          color: chooseColor(feature.properties.mag),
          fillColor: chooseColor(feature.properties.mag)
        });
    }
    // Run function for each feature, give each feature a popup with earthquake attributes
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + "Date/Time: " + new Date(feature.properties.time) + 
        "</h3><hr><p>" + "Magnitude: " + feature.properties.mag+"</p>");
    }
    // GeoJSON layer contrain attributes, and run onEachFeature for each data entry
    var earthquakes = L.geoJSON(data, {
        onEachFeature: onEachFeature,
        pointToLayer: onEachLayer        
    });
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // define map layers
    var streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 15,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });
    // dark map layer 
    var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 15,
        id: 'mapbox/dark-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });

    var outdoormap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 15,
        id: 'mapbox/outdoors-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });
  
    var satellitemap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 15,
        id: 'mapbox/satellite-v9',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });

    // Hold our base layers together in one object
    var baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap,
      "Outdoors Map": outdoormap,
      "Satellite Map": satellitemap
    };
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Fault Lines": faultLines
    };

    // map street plus earthquake layer
    var map = L.map("map", {
      center: [0, 0],
      zoom: 3,
      layers: [earthquakes, faultLines]
    });

    lightmap.addTo(map); 
    // make layer, pass in basemap and overlay, add layer to map. 
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

    var info = L.control({
        position: "bottomright"
    });

    info.onAdd = function(){
        var div = L.DomUtil.create("div","legend");
        return div;
    }

    info.addTo(map);

   document.querySelector(".legend").innerHTML=displayLegend();

}
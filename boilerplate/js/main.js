//map variable
var map;
var minValue;

function createMap(){

    //create the map
    map = L.map('map', {
        center: [35, -95],
        zoom: 3.5
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //getData function
    getData(map);
};

function calcMinValue(data){
    var allValues = [];
    //loop through each park
    for(var feature of data.features){
        //loop through each year
        for(var year = 2015; year <= 2021; year+=5){
            //visits for latest year
              var value = feature.properties["Visits_"+ String(year)];
              allValues.push(value);
        }
    }
    //get minimum value of our array
    var minValue = Math.min(...allValues)

    return minValue;
}

//radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

    return radius;
};

//convert markers to circle markers and add popups
function pointToLayer(feature, latlng){
    var attribute = "Visits_2015";

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    var attValue = Number(feature.properties[attribute]);

    //circle marker radius
    options.radius = calcPropRadius(attValue);

    // circle marker layer
    var layer = L.circleMarker(latlng, options);

    //popup content string
    var popupContent = "<p><b>feature:</b> " + feature.properties.feature + "</p>";

    //add attribute to popup content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b> Visits_ in " + year + ":</b> " + feature.properties[attribute] + " million</p>";

    //tie circle marker to popup
    layer.bindPopup(popupContent, {
          offset: new L.Point(0,-options.radius)
      });
    return layer;
};

function createPropSymbols(data){
    //leaflet and geojson layer
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
};

//Create new sequence controls
function createSequenceControls(){
    //create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);
    
    //set slider attributes
    document.querySelector(".range-slider").max = 6;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;
    
    //add step buttons
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse">Reverse</button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward">Forward</button>');

    //replace button content with images
    document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/reverse.png'>")
    document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/forward.png'>")
};

function getData(map){
    //load the data
    fetch("data/nationalparks.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            minValue = calcMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json);
            createSequenceControls();
        })
};
document.addEventListener('DOMContentLoaded',createMap)
//EVENTS https://stackoverflow.com/questions/22288933/how-to-tell-when-all-visible-tiles-have-fully-loaded/22291297
{
var positron = {};
var hand = {};
var map = {};

var params = {};


/*
    localStorage is blocked for ports other than 80
    those tries are for muting the localStorage error
    while testing on different ports
*/
try{
var savedLoc = localStorage.getItem("mapLoc");
}catch{}
var initialLoc = [31.18460913574325, -72.38891601562501];
if (savedLoc)
    initialLoc = JSON.parse(savedLoc);
params["loc"] = initialLoc;

try{
var savedMarkerLoc = localStorage.getItem("markerLoc");
}catch{}
var initialLoc = [31.18460913574325, -72.38891601562501];
var markerLoc = [0, 0];
if (savedMarkerLoc)
    markerLoc = JSON.parse(savedMarkerLoc);
params["marker"] = markerLoc;

try{
var savedInitialZoom = localStorage.getItem("mapZoom");
}catch{}
var initialZoom = 7;
if (savedInitialZoom)
    initialZoom = parseInt(savedInitialZoom);
params["zoom"] = initialZoom;

var marker = {};

function loadMap()
{
    // mapConnectionStatus = "online";
    map = L.map('mapContainer',
    {
        minZoom: 3,
        maxZoom: 9,
        click: true,
        attributionControl: false,
        radioButtons: true,
        nowPlaying: true,
        zoomControl: false,
        // maxBounds: new L.LatLngBounds(new L.LatLng(84,-180), new L.LatLng(11, 180)),
        maxBoundsViscosity: 0.75
    });

    var worldMiniMap = L.control.worldMiniMap({position: 'bottomleft', map: "assets/ui/minimap.png", width: 230, height: 107, style: {opacity: 0.7, borderRadius: '0px', backgroundColor: '#4272F4'}}).addTo(map);

    hand = L.icon({
        iconUrl: 'assets/ui/pointers/hand.png',
        // shadowUrl: 'assets/icons/hand_shadow.png',

        iconSize:     [100, 50], // size of the icon
        shadowSize:   [100, 50], // size of the shadow
        iconAnchor:   [0, 55], // point of the icon which will correspond to markerLoc's location
        shadowAnchor: [0, 45],  // the same for the shadow
        popupAnchor:  [50, -70] // point from which the popup should open relative to the iconAnchor
    });

    map.setView(initialLoc, initialZoom);

    map.on("click", function(event)
    {
        markerLoc = [event.latlng.lat, event.latlng.lng];
        try{
        localStorage.setItem("markerLoc", JSON.stringify(markerLoc));
        }catch{}
        removeMarker(); setMarker(); setHash();
    });


    map.on("moveend", function(event)
    {
        var center = map.getCenter();
        params["loc"] = [center.lat, center.lng];
        try{
        localStorage.setItem("mapLoc", JSON.stringify(params["loc"]));
        }catch{}

        params["zoom"] = map.getZoom();
        try{
        localStorage.setItem("mapZoom", params["zoom"]);
        }catch{}
        setHash();
    });

    positron = L.tileLayer(window.location.origin + "/toril-map-{z}/tiles/{y}/{x}.png").addTo(map);

    if (window.location.hash.length > 0)
    {
        var commands = window.location.hash.split(";");
        commands[0] = commands[0].substring(1);
        for (var i = 0; i < commands.length; i++)
        {
            var command = commands[i];
            var cmd = command.split("=")[0];

            if (cmd.search("loc") > -1)
            {
                var loc = command.split("=")[1];
                loc = loc.split(",");
                initialLoc = loc;
                params["loc"] = initialLoc;
            }
            else if (cmd.search("zoom") > -1)
            {
                var zoomValue = command.split("=")[1];
                initialZoom = parseInt(zoomValue);
                params["zoom"] = initialZoom;
            }
            else if (cmd.search("marker") > -1)
            {
                var loc = command.split("=")[1];
                loc = loc.split(",");
                markerLoc = loc;
                params["marker"] = markerLoc;
                setMarker();
            }
        }
    }
    else
    {
        setHash();
    }

    // setTimeout(function()
    // {
    //     // clearTimeout(offlineMapBackgroundRotator);
    //     var top = document.querySelector("#top");
    //     if (top)
    //         top.parentNode.removeChild(top);
    //
    //     var bottom = document.querySelector("#bottom");
    //     if (bottom)
    //         bottom.parentNode.removeChild(bottom);
    //     document.querySelector("#mapContainer").style.backgroundColor = "transparent";
    // }, 1000);
}

function setMarker()
{
    marker = L.marker(markerLoc, {icon: hand}).bindPopup("You are here.").addTo(map);
    params["marker"] = markerLoc[0] + "," + markerLoc[1];
}
function removeMarker()
{
    if (marker != {})
        map.removeLayer(marker)
}
function setHash()
{
    var hashstring = "#";
    for (var key in params)
    {
        hashstring += key + "=" + params[key] + ";";
    }
    window.location.hash = hashstring;
}

// var mapConnectionStatus;
// var offlineMapBackgroundRotator;
// WARNING: relic code
//check if map is online
// function checkMapAvailability()
// {
//     document.querySelector("#mapContainer").style.backgroundColor = "#000";
//     var xhttp = new XMLHttpRequest();
//     xhttp.onreadystatechange = function() {
//         if (this.readyState == 4 && this.status == 200)
//         {
//             loadMap();
//             backgroundAnimating = false;
//         }
//         else if (this.readyState == 4)
//         {
//             if (mapConnectionStatus != "offline")
//                 displayMapOfflinePage();
//
//             setTimeout(checkMapAvailability, 5000);
//         }
//     };
//     xhttp.onerror = function(event)
//     {
//         if (mapConnectionStatus != "offline")
//             displayMapOfflinePage();
//     }
//     xhttp.open("GET", "http://" + window.location.host + "/map/boing.boing", true);
//     xhttp.send();
// }

var currentBackgroundID = 0;
var backgrounds;
// function displayMapOfflinePage()
// {
//     mapConnectionStatus = "offline";
//
//     //get
//     var xhttp = new XMLHttpRequest();
//     xhttp.onreadystatechange = function()
//     {
//         if (this.readyState == 4 && this.status == 200)
//         {
//             backgrounds = JSON.parse(this.responseText);
//             currentBackgroundID = Math.floor(Math.random() * backgrounds.length);
//
//             setMapOfflineBackground();
//         }
//     };
//     xhttp.open("GET", "assets/map/loading/backgrounds/data.json", true);
//     xhttp.send();
// }

// var displayDuration = 15 * 1000; //seconds * 1000
// var mapContainer = document.querySelector("#mapContainer");
// var currentContainer = "top";
//
// function switchBackground()
// {
//     var newBackgroundID = Math.floor(Math.random() * backgrounds.length);
//     while (currentBackgroundID == newBackgroundID)
//     {
//         newBackgroundID = Math.floor(Math.random() * backgrounds.length);
//     }
//     currentBackgroundID = newBackgroundID;
//
//     if (currentContainer == "top")
//     {
//         document.querySelector("#top").style.opacity = 0;
//         var bottom = document.querySelector("#bottom");
//         bottom.style.backgroundImage = "url('assets/map/loading/backgrounds/" + backgrounds[currentBackgroundID].filename + "')";
//         bottom.style.opacity = 1;
//         currentContainer = "bottom";
//     }
//     else
//     {
//         document.querySelector("#bottom").style.opacity = 0;
//         var top = document.querySelector("#top");
//         top.style.backgroundImage = "url('assets/map/loading/backgrounds/" + backgrounds[currentBackgroundID].filename + "')";
//         top.style.opacity = 1;
//         currentContainer = "top";
//     }
//     offlineMapBackgroundRotator = setTimeout(switchBackground, displayDuration);
// }
//
// function setMapOfflineBackground()
// {
//     currentBackgroundID = Math.floor(Math.random() * backgrounds.length);
//     mapContainer.innerHTML = "<div id='top' style='position: absolute; width: 100%; height: 100%; margin: 0; background-image: url(\"assets/map/loading/backgrounds/" + backgrounds[currentBackgroundID].filename + "\"); background-size: cover; background-position: center center; transition: opacity 1s ease; opacity: 0;'></div>" +
//                             "<div id='bottom' style='position: absolute; width: 100%; height: 100%; margin: 0; background-size: cover; background-position: center center; transition: opacity 1s ease; opacity: 0;'></div>" +
//                             "<i class='fas fa-unlink' style='margin: 44vh 0vw 0vw 44vw; position: absolute; color: white; font-size: 1.5vw; text-shadow: -2px 2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000; '> <span style='font-family: \"Scaly Sans\"'>MAP OFFLINE</span></i>";
//
//     setTimeout(function()
//     {
//         mapContainer.querySelector("#top").style.opacity = 1;
//     }, 1000);
//
//     scrollTime = 0;
//     backgroundAnimating = true;
//     switchBackground();
// }

// checkMapAvailability(); relic
loadMap()
}


//todo
//https://github.com/thomasbrueggemann/leaflet.boatmarker
// https://github.com/lifeeka/leaflet.bezier#demo
// https://github.com/sandropibia/Leaflet.SelectAreaFeature/
// https://github.com/eJuke/Leaflet.Canvas-Markers
// https://github.com/elfalem/Leaflet.curve
// https://gitlab.com/IvanSanchez/Leaflet.GLMarkers
// https://gitlab.com/IvanSanchez/Leaflet.GLMarkers
// https://wbkd.github.io/leaflet-swoopy/
// https://github.com/adoroszlai/leaflet-distance-markers
// https://github.com/mapshakers/leaflet-icon-pulse
// https://github.com/heyman/leaflet-usermarker
// https://rubenspgcavalcante.github.io/leaflet-ant-path/
// https://github.com/0n3byt3/Leaflet.MarkerPlayer
// https://igor-vladyka.github.io/leaflet.motion/
// https://github.com/Igor-Vladyka/leaflet.motion
// https://github.com/naturalatlas/leaflet-transitionedicon
// https://github.com/ghybs/Leaflet.FeatureGroup.SubGroup
// https://github.com/ProminentEdge/leaflet-measure-path
// https://github.com/clavijojuan/L.multiControl
// https://github.com/clavijojuan/L.cascadeButtons
// https://meteo-concept.github.io/leaflet-inflatable-markers-group/example2
// https://github.com/Leaflet/Leaflet.markercluster
// https://github.com/hallahan/LeafletPlayback
// https://github.com/linghuam/Leaflet.TrackPlayBack
// https://maydemirx.github.io/leaflet-tag-filter-button/
// https://luka1199.github.io/Leaflet.AnimatedSearchBox/examples/example_fuse.html
// https://github.com/wrwrh/leaflet-popupmovable
// https://github.com/jjimenezshaw/Leaflet.Control.Layers.Tree
// https://github.com/davicustodio/Leaflet.StyledLayerControl
// https://github.com/ScanEx/Leaflet-IconLayers

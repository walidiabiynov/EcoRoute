const APIKey = "x5fo9v5HB4bh1Boxq98XUddpp4vr2x9NRelXAaPyt0E";
const platform = new H.service.Platform({
  apikey: APIKey,
});

var map;

const startIcon = `<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
width="24.000000pt" height="24.000000pt" viewBox="0 0 24.000000 24.000000"
preserveAspectRatio="xMidYMid meet">
<g transform="translate(0.000000,24.000000) scale(0.100000,-0.100000)"
fill="#4d4d4d" stroke="">
<path d="M65 215 c-16 -15 -25 -36 -25 -54 0 -31 65 -161 80 -161 15 0 80 130
80 159 0 69 -86 106 -135 56z m69 -21 c9 -3 16 -16 16 -29 0 -25 -21 -38 -45
-29 -18 7 -20 50 -2 57 6 3 13 6 14 6 1 1 8 -2 17 -5z"/>
</g>
</svg>`;

const endIcon = `<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
width="24.000000pt" height="24.000000pt" viewBox="0 0 24.000000 24.000000"
preserveAspectRatio="xMidYMid meet">
<g transform="translate(0.000000,24.000000) scale(0.100000,-0.100000)"
fill="#00cc00" stroke="">
<path d="M65 215 c-16 -15 -25 -36 -25 -54 0 -31 65 -161 80 -161 15 0 80 130
80 159 0 69 -86 106 -135 56z m69 -21 c9 -3 16 -16 16 -29 0 -25 -21 -38 -45
-29 -18 7 -20 50 -2 57 6 3 13 6 14 6 1 1 8 -2 17 -5z"/>
</g>
</svg>`;

const simpleDotIcon =
  '<svg width="18" height="18" ' +
  'xmlns="http://www.w3.org/2000/svg">' +
  '<circle cx="8" cy="8" r="8" ' +
  'fill="#1b468d" stroke="white" stroke-width="1"  />' +
  "</svg>";

//TODO Add slippy/user input to map position/zoom
//ADD IN WAYPOINTS for each step, with popup dialog with instructions

function instantiateMap() {
  //Creates a map placed in whatever div has the id map-container, positions it at Toronto
  let defaultLayers = platform.createDefaultLayers();
  map = new H.Map(
    document.querySelector("#map-container"),
    defaultLayers.vector.normal.map,
    {
      zoom: 13,
      center: { lat: 43.65107, lng: -79.347015 },
    }
  );
  window.addEventListener("resize", () => map.getViewPort().resize());
  return map;
}

function saveToSession(key, value) {
  //Just saves to sessionStorage, I'm outsourcing it to a function in case we change how we save data in the future
  sessionStorage.setItem(key, JSON.stringify(value));
}

function loadFromSession(key) {
  return JSON.parse(sessionStorage.getItem(key));
}

function addMarker(
  coords,
  svgMarkup = '<svg width="24" height="24" ' +
    'xmlns="http://www.w3.org/2000/svg">' +
    '<rect stroke="white" fill="red" x="1" y="1" width="22" ' +
    'height="22" /><text x="12" y="18" font-size="12pt" ' +
    'font-family="Arial" font-weight="regular" text-anchor="middle" ' +
    'fill="white">HI</text></svg>'
) {
  //Adds a styled marker to the map (default filler for style) at coords = 'lat,lng' or {lat: lng:} in an object
  //DOES NOT center map at location, make sure to do so
  if (typeof coords === "string") {
    coords = coords.split(",");
    coords = { lat: coords[0], lng: coords[1] };
  }
  let icon = new H.map.Icon(svgMarkup);
  let marker = new H.map.Marker(coords, { icon: icon });

  map.addObject(marker);
}

function addLine(map, startPoint, endPoint) {
  //places a line on the map between two points given
  //   let lineStyle = {
  //     strokeColor: "black",
  //     fillColor: "rgba(255, 255, 255, 0.5)",
  //     lineWidth: 2,
  //     lineCap: "square",
  //     lineJoin: "bevel",
  //   };

  let points = [startPoint, endPoint];

  let linestring = new H.geo.LineString();
  points.forEach(function (point) {
    linestring.pushPoint(point);
  });

  let polyline = new H.map.Polyline(linestring, { style: { lineWidth: 3 } });

  map.addObject(polyline);
}

async function processSearch(searchString) {
  //Takes a string of a location, ex. 8 Bloor St. W, Toronto
  //Returns all of the objects the string finds, to be chosen from

  function geocodeWrapper(input) {
    return new Promise((resolve, reject) => {
      platform.getSearchService().geocode(input, resolve, reject);
    });
  }

  const geocodedOptions = await geocodeWrapper({ q: searchString });
  return geocodedOptions;

  // await platform.getSearchService().geocode(
  //   { q: searchString },
  //   function (returnedChoices) {
  //     populateChoiceList(returnedChoices, destinationOrOrigin);
  //   },
  //   function (error) {
  //     console.log("Something went wrong", error);
  //   }
  // );
}

function populateChoiceList(returnedLocations, destinationOrOrigin) {
  //This is a placeholder, ideally this populates our method of choosing (or chooses based on criteria we have) then calls the function to render it
  //It saves the choice, it also returns it just in case that's needed for function chaining later
  let choices = returnedLocations.items;
  let choice;

  if (choices.length === 0) {
    choice = choices[0];
  } else {
    //HARDCODING CHOICE FOR NOW
    //We could either attach this function to a button or choose based on location
    choice = choices[0];
  }
  saveToSession(
    destinationOrOrigin === "destination" ? "destination" : "origin",
    choice
  );
  return choice;
}

function getAllRoutes() {
  //Once called this function loads origin and destination from sessionStorage tags origin and destination
  //It then iterates through all travel methods and processes a route through each
  let origin = loadFromSession("origin");
  let destination = loadFromSession("destination");
  let transitTypes = [
    ["car", "car"],
    ["bicycle", "bike"],
    ["truck", "truck"],
    ["pedestrian", "walk"],
    ["publicTransport", "pt"],
  ];

  transitTypes.forEach(function (transitType) {
    getRoute(origin.position, destination.position, transitType);
  });
}

async function getRoute(startPoint, endPoint, transitType) {
  //This function accepts start and end objects with lat and lng, also an array that contains the name of the transit type ex. 'bicycle' and the key under which to store the data ex. distance-bike
  let method = "fastest;" + transitType[0];
  let transitTypeKey = transitType[1];
  try {
    response = await fetch(
      `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=${APIKey}` +
        `&waypoint0=geo!${startPoint.lat},${startPoint.lng}` +
        `&waypoint1=geo!${endPoint.lat},${endPoint.lng}&mode=${method}` +
        `;traffic:disabled&instructionformat=text&routeattributes=shape`
    ).then((response) => response.json());
    console.log("getRoute -> response", response);

    //This call has the potential to return multiple routes, that's why they're in a route array instead of just an object
    //I hard code choosing the first option here, but we can figure out implementation of some form of choice if we want

    let distanceTravelled = response.response.route[0].summary.distance / 1000;
    let travelTime = response.response.route[0].summary.travelTime;
    let transitText = response.response.route[0].summary.text;
    let shape = response.response.route[0].shape;
    let directions = response.response.route[0].leg[0].maneuver;

    saveToSession(`distance-${transitTypeKey}`, distanceTravelled);
    saveToSession(`traveltime-${transitTypeKey}`, travelTime);
    saveToSession(`travel-text-${transitTypeKey}`, transitText);
    saveToSession(`shape-${transitTypeKey}`, shape);
    saveToSession(`directions-${transitTypeKey}`, directions);
    return { route: response.response };
  } catch (e) {
    console.log(
      `an error occured fetching the routing information from Here`,
      e
    );
    return null;
  }
}

function mapRoute(routeKey) {
  //This function takes the chosen route and maps it on the page
  renderRoute(map, loadFromSession(`shape-${routeKey}`));
}

function renderRoute(map, arrayOfPoints) {
  //Places a set of lines on the map, between points given in the form of an array of strings of 'lat,lng', 'lat,lng'.
  let linestring = new H.geo.LineString();

  arrayOfPoints.forEach(function (point) {
    // linestring.pushPoint(point);
    point = point.split(",");
    linestring.pushLatLngAlt(point[0], point[1]);
  });
  let polyline = new H.map.Polyline(linestring, { style: { lineWidth: 3 } }); // TODO change line styling
  //Adding a marker to first and last point

  //DEMO If we want a marker at each point along the path, uncomment this code and comment out the first and last setting
  // arrayOfPoints.forEach(function(point, index){

  //   svgMarkup = '<svg width="24" height="24" ' +
  //     'xmlns="http://www.w3.org/2000/svg">' +
  //     '<rect stroke="white" fill="red" x="1" y="1" width="22" ' +
  //     'height="22" /><text x="12" y="18" font-size="12pt" ' +
  //     'font-family="Arial" font-weight="regular" text-anchor="middle" ' +
  //     `fill="white">${index}</text></svg>`
  //   addMarker(point, svgMarkup)
  // })
  // arrayOfPoints.forEach(function(point, index){
  //    addMarker(point, simpleDotIcon)
  // })

  addMarker(arrayOfPoints[0], endIcon);
  addMarker(arrayOfPoints[arrayOfPoints.length - 1], startIcon);

  map.addObject(polyline);
  // map.addObjects([polyline, markerStart, markerEnd]);
  // map.getViewModel().setLookAtData({
  //   bounds: polyline.getBoundingBox(),
  // });
  bBox = polyline.getBoundingBox()
  bBox.ha += 0.0005 //These are the variables the API uses to define the bounding box, I'm just making it bigger on the N and S to make it a little prettier.
  bBox.ka -= 0.0005 
  map.getViewModel().setLookAtData({bounds: bBox})
}

function placePinOnMap(map, locationObject) {
  //Takes a location object in the Here API format, places a pin at that location and
  map.addObject(new H.map.Marker(locationObject.position));
  map
    .getViewModel()
    .setLookAtData({ position: locationObject.position, zoom: 16 });
}

//TESTING AREA for getting all routes between two points
// async function temp() {
//   sessionStorage.clear();
//   instantiateMap();
//   const destOptions = await processSearch("8 Bloor St. W, Toronto");
//   populateChoiceList(destOptions, "destination");
//   const originOptions = await processSearch("499 Church St. Toronto", "origin");
//   populateChoiceList(originOptions, "origin");
//   getAllRoutes();

//   setTimeout(function () {
//     mapRoute("bike");
//   }, 3000);
// }

// temp();

// map = instantiateMap();
// addMarker({ lat: 43.6652641, lng: -79.3807487 });

// setTimeout(getAllRoutes, 2000);
// map = instantiateMap();
// mapRoute('walk')
// setTimeout(function(){mapRoute("walk")}, 8000);

// Pardon this, this is here while I work out all of the options to request different data from the api
// https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=x5fo9v5HB4bh1Boxq98XUddpp4vr2x9NRelXAaPyt0E&waypoint0=geo!43.687850,-79.395514&waypoint1=geo!43.664739,-79.413175&mode=fastest;car;traffic:disabled&instructionformat=text
//https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=x5fo9v5HB4bh1Boxq98XUddpp4vr2x9NRelXAaPyt0E&waypoint0=geo!43.687850,-79.395514&waypoint1=geo!43.664739,-79.413175&mode=fastest;car;traffic:disabled&instructionformat=text&representation=display
//https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=x5fo9v5HB4bh1Boxq98XUddpp4vr2x9NRelXAaPyt0E&waypoint0=geo!43.687850,-79.395514&waypoint1=geo!43.664739,-79.413175&mode=fastest;car;traffic:disabled&instructionformat=text&routeAttributes=summary
//https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=x5fo9v5HB4bh1Boxq98XUddpp4vr2x9NRelXAaPyt0E&waypoint0=geo!43.687850,-79.395514&waypoint1=geo!43.664739,-79.413175&mode=fastest;car;traffic:disabled&instructionformat=text&routeAttributes=shape

//SITUATION : Initial map load on the front page
// instantiateMap()
//Loads in whatever div has the id map-container

//SITUATION: On main page, destination typed into search bar and search is pressed
// let tempPlaceholderName = '8 Bloor St. W, Toronto'
// map = instantiateMap();
// processSearch(tempPlaceholderName)
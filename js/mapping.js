const APIKey = "x5fo9v5HB4bh1Boxq98XUddpp4vr2x9NRelXAaPyt0E";
const platform = new H.service.Platform({
  apikey: APIKey,
});

var map;

//TODO render points at end and start of the addLines function
//Move functions to more linear layout and clean file

//TODO Add slippy/user input to map position/zoom
//Catch turn by turn in getRoutes and place in local
//todo setup turn by turn directions saved
//implement promise in geocode function
//implement error catching in getroutes and geocode

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

function addMarker(map, coords, SVGMarker = "") {
  //Adds a styled marker to the map (default filler for style) at coords = {lat: lng: }
  if (SVGMarker === "") {
    let svgMarkup =
      '<svg width="24" height="24" ' +
      'xmlns="http://www.w3.org/2000/svg">' +
      '<rect stroke="white" fill="red" x="1" y="1" width="22" ' +
      'height="22" /><text x="12" y="18" font-size="12pt" ' +
      'font-family="Arial" font-weight="regular" text-anchor="middle" ' +
      'fill="white">HI</text></svg>';
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

  function geocodeWrapper(input){
    return new Promise( (resolve, reject) => {
      platform.getSearchService().geocode(input, resolve, reject)
    })
  }

  const geocodedOptions = await geocodeWrapper({q: searchString})
  return geocodedOptions


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
  choices = returnedLocations.items;

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
  return choice
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

  response = await fetch(
    `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=${APIKey}&waypoint0=geo!${startPoint.lat},${startPoint.lng}&waypoint1=geo!${endPoint.lat},${endPoint.lng}&mode=${method};traffic:disabled&instructionformat=text&routeattributes=shape`
  );

  if (response.ok) {
    response = await response.json();
    console.log("getRoute -> response", response);

    let distanceTravelled = response.response.route[0].summary.distance / 1000;
    let travelTime = response.response.route[0].summary.travelTime;
    let transitText = response.response.route[0].summary.text;
    let shape = response.response.route[0].shape;
    tempRet = [distanceTravelled, travelTime, transitText, shape];

    saveToSession(`distance-${transitTypeKey}`, distanceTravelled);
    saveToSession(`traveltime-${transitTypeKey}`, travelTime);
    saveToSession(`travel-text-${transitTypeKey}`, transitText);
    saveToSession(`shape-${transitTypeKey}`, shape);
  }

  return { route: response.response };
}

function mapRoute(routeKey) {
  //This function takes the chosen route and maps it on the page
  addLines(map, loadFromSession(`shape-${routeKey}`));
}

function addLines(map, arrayOfPoints) {
  //Places a set of lines on the map, between points given in the form of an array of strings of 'lat,lng', 'lat,lng'.
  let linestring = new H.geo.LineString();
  console.log("addLines -> arrayOfPoints", arrayOfPoints);

  arrayOfPoints.forEach(function (point) {
    // linestring.pushPoint(point);
    point = point.split(",");
    console.log("addLines -> point", point);
    linestring.pushLatLngAlt(point[0], point[1]);
  });
  let polyline = new H.map.Polyline(linestring, { style: { lineWidth: 3 } }); // TODO change line styling
  //Adding a marker to first and last point
  // let markerStart = new H.map.Marker(arrayOfPoints[0]);
  // let markerEnd = new H.map.Marker(arrayOfPoints[arrayOfPoints.length - 1]);
  map.addObject(polyline);
  // map.addObjects([polyline, markerStart, markerEnd]);
  map.getViewModel().setLookAtData({
    bounds: polyline.getBoundingBox(), // TODO add slight zoomout here to better show the line
  });
}

function placePinOnMap(map, locationObject) {
  //Takes a location object in the Here API format, places a pin at that location and
  map.addObject(new H.map.Marker(locationObject.position));
  map
    .getViewModel()
    .setLookAtData({ position: locationObject.position, zoom: 16 });
}

//TESTING AREA for getting all routes between two points
async function temp() {
  sessionStorage.clear();
  instantiateMap();
  const destOptions = await processSearch("8 Bloor St. W, Toronto");
  populateChoiceList(destOptions, 'destination')
  const originOptions = await processSearch("499 Church St. Toronto", "origin");
  populateChoiceList(originOptions, 'origin')
  getAllRoutes();

  setTimeout(function () {
    mapRoute("bike");
  }, 3000);
}

// temp();

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

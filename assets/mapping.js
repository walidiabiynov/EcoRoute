const APIKey = "x5fo9v5HB4bh1Boxq98XUddpp4vr2x9NRelXAaPyt0E";
const platform = new H.service.Platform({
  apikey: APIKey,
});

var map;

function instantiateMap() {
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

function saveToSession(key, value){
  //Just saves to sessionStorage, I'm outsourcing it to a function in case we change how we save data in the future
  sessionStorage.setItem(key, JSON.stringify(value))
}

function loadFromSession(key){
  return JSON.parse(sessionStorage.getItem(key))
}


function addMarker(map, coords) {
  let svgMarkup =
    '<svg width="24" height="24" ' +
    'xmlns="http://www.w3.org/2000/svg">' +
    '<rect stroke="white" fill="red" x="1" y="1" width="22" ' +
    'height="22" /><text x="12" y="18" font-size="12pt" ' +
    'font-family="Arial" font-weight="regular" text-anchor="middle" ' +
    'fill="white">HI</text></svg>';

  let icon = new H.map.Icon(svgMarkup);
  let marker = new H.map.Marker(coords, { icon: icon });

  map.addObject(marker);
}

function addLine(map, startPoint, endPoint) {
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

function addLines(map, arrayOfPoints) {
  let linestring = new H.geo.LineString();
  console.log(arrayOfPoints);
  arrayOfPoints.forEach(function (point) {
    // linestring.pushPoint(point);
    point = point.split(",");
    linestring.pushLatLngAlt(point[0], point[1]);
  });
  let polyline = new H.map.Polyline(linestring, { style: { lineWidth: 3 } });
  map.addObject(polyline);
  map.getViewModel().setLookAtData({
    bounds: polyline.getBoundingBox(),
  });
}

// WORKING ON ROUTING
async function getRoute(startPoint, endPoint, transitType) {
  //This function accepts start and end objects with lat and lng, also an array that contains the name of the transit type ex. 'bicycle' and the key under which to store the data ex. distance-bike
  let method = 'fastest;' + transitType[0]
  let transitTypeKey = transitType[1]

  response = await fetch(
    `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=${APIKey}&waypoint0=geo!${startPoint.lat},${startPoint.lng}&waypoint1=geo!${endPoint.lat},${endPoint.lng}&mode=${method};traffic:disabled&instructionformat=text&routeattributes=shape`
  );
  
  if (response.ok) {
    response = await response.json();
    console.log(response)

    let distanceTravelled = await response.response.route[0].summary.distance
    let travelTime = await response.response.route[0].summary.travelTime
    let transitText = await response.response.route[0].summary.text
    let shape = await response.response.route[0].shape
    console.log(`Running for ${transitTypeKey} - `, shape)
    saveToSession(`distance-${transitTypeKey}`, distanceTravelled)
    saveToSession(`traveltime-${transitTypeKey}`, travelTime)
    saveToSession(`travel-text-${transitTypeKey}`, transitText)
    saveToSession(`shape-${transitTypeKey}`, shape)
  }

  return {route: response.response}
  
  
  // map = instantiateMap();
  // addLines(map, response.response.route[0].shape);






  // //This function displays the map, renders the two points, and adds the lines for the route
  // //  It also passes the
  // response = await fetch(
  //   `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=${APIKey}&waypoint0=geo!${startPoint.lat},${startPoint.lng}&waypoint1=geo!${endPoint.lat},${endPoint.lng}&mode=${method};traffic:disabled&instructionformat=text&routeattributes=shape`
  // );

  // if (response.ok) {
  //   response = await response.json();
  //   map = instantiateMap();
  //   console.log(response);
  //   addLines(map, response.response.route[0].shape);
  // }

}

function mapRoute(routeKey){
  //This function takes the chosen route and maps it on the page
  


}


function processSearch(searchString, destinationOrOrigin='destination'){
  //Takes a string of a location, ex. 8 Bloor St. W, Toronto
  //Returns all of the objects the string finds, to be chosen from
  // service.geocode({q: searchString}, populateChoiceList, function(error){console.log("Something went wrong", error)})
    
  let service = platform.getSearchService();
  service.geocode({q: searchString}, function(returnedChoices){populateChoiceList(returnedChoices, destinationOrOrigin)}, function(error){console.log("Something went wrong", error)})
  
}
  
function populateChoiceList(returnedLocations, destinationOrOrigin){
  //This is a placeholder, ideally this populates our method of choosing (or chooses based on criteria we have) then calls the function to render it
  choices = returnedLocations.items

  if (choices.length === 0){
    choice = choices[0]
  } else {

    //HARDCODING CHOICE FOR NOW
    //We could either attach this function to a button or choose based on location
    choice = choices[0]
  }
  saveToSession((destinationOrOrigin === 'destination') ? 'destination' : 'origin', choice)
}


function placePinOnMap(map, locationObject){
  //Takes a location object in the Here API format, places a pin at that location and 
  map.addObject(new H.map.Marker(locationObject.position))
  map.getViewModel().setLookAtData({position: locationObject.position, zoom: 16})
}

function getAllRoutes(){
  let origin = loadFromSession('origin')
  let destination = loadFromSession('destination')
  let transitTypes = [['car', 'car'], ['bicycle', 'bike'], ['truck', 'truck'], ['pedestrian', 'walk'], ['publicTransport', 'pt']]

  transitTypes.forEach(function(transitType){

    getRoute(origin.position, destination.position, transitType)
  })

}

//TESTING AREA for getting all routes between two points
// sessionStorage.clear()
// processSearch('8 Bloor St. W, Toronto')
// processSearch('499 Church St. Toronto', 'origin')
// setTimeout(getAllRoutes, 2000)


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

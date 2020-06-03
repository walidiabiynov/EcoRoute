const platform = new H.service.Platform({
  apikey: "x5fo9v5HB4bh1Boxq98XUddpp4vr2x9NRelXAaPyt0E",
});

function createMap(mapOrigin = { lat: 43.65107, lng: -79.347015 }) {
  //default map based in Toronto, placed in whatever element has the id 'map-container'
  //origin can be changed with array of lat and lng
  let defaultLayers = platform.createDefaultLayers();

  let map = new H.Map(
    document.querySelector("#map-container"),
    defaultLayers.vector.normal.map,
    {
      zoom: 15,
      center: mapOrigin,
    }
  );
  return map;
}

function findRoute(
  routeStart,
  routeEnd,
  routeMethod = "pedestrian",
  returnMap = true
) {
  //finds route found between two gps coords provided in objects of {lat: , lon: }, using a means of transit
  //'car' is the default if no method provided
  //methods include : car, pedestrian, truck
  //if returnMap is true, also calls function to create map and render result on container #map-container
  //TODO look into 'short' route as well, might be more fuel efficient and we can provide that information as well
  let routingParameters = {
    routingMode: "fast",
    transportMode: routeMethod,
    origin: `${routeStart.lat},${routeStart.lng}`,
    destination: `${routeEnd.lat},${routeEnd.lng}`,
    return: "polyline,instructions,actions,summary,turnByTurnActions", //the instructions tag returns a list of turn by turn instructions as well.  I'm throwing them all in so we can peruse them.
  };

  // Get an instance of the routing service version 8:
  let router = platform.getRoutingService(null, 8);

  let results = router.calculateRoute(routingParameters, mapRoute, function (
    error
  ) {
    alert(error.message);
  });
//   console.log(Object.keys(results).forEach(function(key){console.log(results[key])}))  //Routing is within this, in routes.sections.actions, in each one in .instruction
    //TODO Get the route in a different fashion, split the call to mapRoute and break out the instructions to be saved in sessionStorage so we can display them in the dialog later
}

function mapRoute(result) {
  let defaultLayers = platform.createDefaultLayers();

  let map = new H.Map(
    document.querySelector("#map-container"),
    defaultLayers.vector.normal.map,
    {
      zoom: 13,
      center: { lat: 43.65107, lng: -79.347015 },
    }
  );
  if (result.routes.length) {
    result.routes[0].sections.forEach((section) => {
      //THIS SECTION IS DIRECTLY COPIED FROM EXAMPLE
      // Create a linestring to use as a point source for the route line
      let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

      // Create a polyline to display the route:
      let routeLine = new H.map.Polyline(linestring, {
        style: { strokeColor: "blue", lineWidth: 3 },
      });

      // Create a marker for the start point:
      let startMarker = new H.map.Marker(section.departure.place.location);

      // Create a marker for the end point:
      let endMarker = new H.map.Marker(section.arrival.place.location);

      // Add the route polyline and the two markers to the map:
      map.addObjects([routeLine, startMarker, endMarker]);

      // Set the map's viewport to make the whole route visible:
      map.getViewModel().setLookAtData({ bounds: routeLine.getBoundingBox() });
    });
  }
}
let origin = { lat: "43.687850", lng: "-79.395514" };
let destination = { lat: "43.664739", lng: "-79.413175" };
findRoute(origin, destination, 'pedestrian');
// createMap()


//TODO Get lat lng from name, incorporate that into function that then calls the mapper.  Also, pull location from phone and have it pass lng lat directly.
//TODO look into if we can get a slippy map out of this API
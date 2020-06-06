function detailsButton(event) {
  console.log("details button clicked");
  console.log(event.target.dataset.method);
  saveToSession("detail-method-selected", event.target.dataset.method);
  saveToSession("detail-method-rate-chosen", event.target.dataset.rate);
  window.location.href = "./details.html";
}

//-----------------------------------------
map = instantiateMap();

destination = loadFromSession("destination");
$("#destination-feedback").text(
  destination.address.label.split(",").slice(0, 2).toString()
);

const chosenTransportMethods = loadFromSession("results");
const rowEl = $("#results-row");

let distances = [];

mapRoute(mapKeyTranslator(chosenTransportMethods[0].mode));

chosenTransportMethods.forEach(function (transportMethod, index) {

  transportMethodId = transportMethod.mode;

  //This fixes a problem that micro-cars and whatnot are not keys included in the routes
  if (
    ["micro-car", "compact-car", "sedan", "suv"].includes(transportMethodId)
  ) {
    console.log("avast a car");
    transportMethodId = "car";
  }

  console.log(transportMethod);
  console.log(loadFromSession(`distance-${transportMethodId}`).toFixed(1));
  distances.push(loadFromSession(`distance-${transportMethodId}`));

  let cardElText =
    `<div class=""><div class="card results-card mx-3"><div class="card-body">` +
    `<h5 class="card-title">${
      transportNameVals[transportNameKeys.indexOf(transportMethodId)]
    }</h5>` +
    `<div class="card-text">` +
    `<p>CO<sup>2</sup>: <span class="info-text">${transportMethod.co2.toFixed(
      1
    )} <span class="units">g</span></span></p>` +
    `<p>Time: <span class="info-text">${(
      loadFromSession(`traveltime-${transportMethodId}`) / 60
    ).toFixed(1)} minutes</span></p>`+
    `<p>Distance: <span class="info-text">${loadFromSession(`distance-${transportMethodId}`).toFixed(
      1
    )} km</span></p>` +
    `<button class="btn btn-success" data-method="${transportMethod.mode}" data-rate="${transportMethod.co2}" onclick="detailsButton(event)">Learn More</button>` +
    `</div></div></div></div>`;
  rowEl.append(cardElText);
});

if (distances.length > 1) {
  distances.sort((a, b) => b - a);
  console.log("distances", distances);
  $("#distance-range").text(
    "between " +
      distances[distances.length - 1].toFixed(1) +
      " to " +
      distances[0].toFixed(1)
  );
} else {
  $("#distance-range").text(distances[0].toFixed(1));
}

//TODO catch if the range is within a certain amount and just display that amount

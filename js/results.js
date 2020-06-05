//-----------------------------------------
destination = loadFromSession("destination");
$("#destination-feedback").text(destination.address.label);

const chosenTransportMethods = loadFromSession("results")
const rowEl = $('#results-row')

chosenTransportMethods.forEach(function (transportMethod, index) {

  let cardElText =
    `<div class="col-sm-3"><div class="card"><div class="card-body">` +
    `<h5 class="card-title">${
      transportNameVals[transportNameKeys.indexOf(transportMethod.mode)]
    }</h5>` +
    `<div class="card-text">` +
    `<p>CO2: ${transportMethod.co2.toFixed(1)} <span class="units">g/kg<span></p>` +
    `<p>Time: ${(loadFromSession(`traveltime-${transportMethod.mode}`)/60).toFixed(1)} minutes</p>` +
    `<p>Distance: ${loadFromSession(`distance-${transportMethod.mode}`).toFixed(1)} km</p>` +
    `<button class="btn btn-success">Learn More</button>` +
    `</div></div></div></div>`;
    rowEl.append(cardElText)
});

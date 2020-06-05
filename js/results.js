//-----------------------------------------
destination = loadFromSession("destination");
$("#destination-feedback").text(destination.address.label.split(',').slice(0, 2).toString());

const chosenTransportMethods = loadFromSession("results")
const rowEl = $('#results-row')

let distances = []
chosenTransportMethods.forEach(function (transportMethod, index) {

  transportMethodId = transportMethod.mode

  //This fixes a problem that micro-cars and whatnot are not keys included in the ro utes
  if (['micro-car', 'compact-car', 'sedan', 'suv'].includes(transportMethodId)){
    console.log('avast a car')
    transportMethodId = 'car'
  }


  console.log(transportMethod)
  console.log(loadFromSession(`distance-${transportMethodId}`).toFixed(1))
  distances.push(loadFromSession(`distance-${transportMethodId}`))
  
  let cardElText =
    `<div class="col-sm-3"><div class="card"><div class="card-body">` +
    `<h5 class="card-title">${
      transportNameVals[transportNameKeys.indexOf(transportMethodId)]
    }</h5>` +
    `<div class="card-text">` +
    `<p>CO2: ${transportMethod.co2.toFixed(1)} <span class="units">g/kg<span></p>` +
    `<p>Time: ${(loadFromSession(`traveltime-${transportMethodId}`)/60).toFixed(1)} minutes</p>` +
    `<p>Distance: ${loadFromSession(`distance-${transportMethodId}`).toFixed(1)} km</p>` +
    `<button class="btn btn-success">Learn More</button>` +
    `</div></div></div></div>`;
    rowEl.append(cardElText)
});

if (distances.length > 1){
  distances.sort((a, b) => b - a)
  console.log("distances", distances)
  $('#distance-range').text('between ' + distances[distances.length - 1].toFixed(1) + ' to ' + distances[0].toFixed(1))
} else {
  
  $('#distance-range').text(distances[0].toFixed(1))
}

//TODO catch if the range is within a certain amount and just display that amount
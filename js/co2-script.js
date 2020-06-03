// Create input variables
var distance = 3; // Has to be in km, will be taken from HERE output
var options = [
    { 
        // CO2 emission in g/km, data by: https://www.carbonfootprint.com/ 
        id: "car",
        mode: ["micro-car", "compact-car", "sedan", "suv"],
        gas: ["gasoline", "diesel", "electric"],
        chosen: false,
        coEmissionGasoline: [ 125.0692, 147.144, 156.4524, 230.2278 ],
        coEmissionDiesel: [ 115.6062, 138.82, 141.0578, 170.4394 ],
        coEmissionElectric: 7.7, // Considering the current mix of energy production in Ontario: https://www.cer-rec.gc.ca/nrg/ntgrtd/mrkt/snpsht/2018/09-01-1hwrnrgprjctsfnncd-eng.html
    }, 
    { 
        // CO2 emission in g/km, TTC as an example: http://www.ttc.ca/PDF/About_the_TTC/Sustainability_Reports/2013_Sustainability_Report.PDF
        id: "pt",
        mode:"publicTransport",
        chosen: false,
        coEmission: 64
    }, 
    {
        id: "bike",
        mode: "bike",
        chosen: false,
        coEmission: 0
    }, 
    {
        id: "walk",
        mode: "pedestrian",
        chosen: false,
        coEmission: 0
    }
]

// Add class "selected-fuel" to the selected fuel type
    // Assumption: we'll be using a Bootstrap button group for this part: https://getbootstrap.com/docs/4.0/components/button-group/
const fuelSelection = document.querySelector("#fuel-selector");
fuelSelection.addEventListener("click", function(e){
    var otherButtons = fuelSelection.childNodes;
    otherButtons[1].classList.remove("selected-fuel");
    otherButtons[3].classList.remove("selected-fuel");
    otherButtons[5].classList.remove("selected-fuel");
    e.target.classList.add("selected-fuel");
})

// Mirror user input
    // Add inline onclick events to the buttons (each button has an id), click will fire addType() function
    // If button is clicked, an object will be added to userInput array
var userInput = [];
function addType(e){
    var mode = e.target.id;
    if(e.target.id == "walk" || e.target.id == "bike" || e.target.id == "pt"){
        var inputObject = {type: mode}
        userInput.push(inputObject)
    } else { // The remaining options are all car-related and require the fuel-input also
        var fuelType = document.getElementsByClassName("selected-fuel").id;
        var inputObject = {type: mode, fuel: fuelType}
    }
}

// Save user choices to array to iterate over
var resultsList = [];
var userChoices = [ // This is a mockup of the representation of user selections
    {
        id: options[0].id,
        em: options[0].coEmissionGasoline[1],
    },
    {
        id: options[1].id,
        em: options[1].coEmission,
    },
    {
        id: options[2].id,
        em: options[2].coEmission
    }
];
userChoices.forEach(calculateEmission);

// Calculate CO2 emissions
function calculateEmission(choice){
    var result;
    result = choice.em * distance;
    var id = choice.id;
    var pushResult = {mode: id, co2: result}
    resultsList.push(pushResult);
}

// Render results on page
resultsList.forEach(renderResults);
function renderResults(result){
    document.getElementById(`${result.mode}CO2`).textContent = result.co2;
    document.getElementById(`${result.mode}Distance`).textContent = distance;
}
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
    var inputObject = {};
    function addType(e){
        var carEmission;
        var mode = e.target.id;
        switch(mode){
            case "walk":
                inputObject = {id: mode, em: options[3].coEmission};
                userInput.push(inputObject)
                break;
            case "bike":
                inputObject = {id: mode, em: options[2].coEmission};
                userInput.push(inputObject)
                break;
            case "pt":
                inputObject = {id: mode, em: options[1].coEmission};
                userInput.push(inputObject)
                break;
            default:
                var index;
                switch(mode){
                    case "micro-car":
                        index = 0;
                        break;
                    case "compact-car":
                        index = 1;
                        break;
                    case "sedan":
                        index = 2;
                        break;
                    case "suv":
                        index = 3;
                        break;
                }
                var fuelType;
                function getCarEmission(){
                    fuelType = document.getElementsByClassName("selected-fuel")[0].id;
                    switch(fuelType){
                        case "gasoline":
                            return options[0].coEmissionGasoline[index];
                        case "diesel":
                            return options[0].coEmissionDiesel[index];
                        case "electric":
                            return options[0].coEmissionElectric;
                    }
                }
                carEmission = getCarEmission();
                inputObject = {id: mode, em: carEmission};
                userInput.push(inputObject);
        }
        userInput.forEach(calculateEmission);
    }

// Calculate CO2 emissions
var resultsList = [];
var result;

function calculateEmission(choice){
    result = choice.em * distance;
    var id = choice.id;
    var pushResult = {mode: id, co2: result};
    document.getElementsByClassName(`${id}CO2`)[0].textContent = result;
    document.getElementsByClassName(`${id}Distance`)[0].textContent = distance;
    resultsList.push(pushResult);
}
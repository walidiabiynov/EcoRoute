// Create input variables
var distance; // Has to be in km, will be taken from HERE output
    // Placeholder input for testing
    sessionStorage.setItem("distance-truck", 4);
    sessionStorage.setItem("distance-car", 3);
    sessionStorage.setItem("distance-pt", 2.7);
    sessionStorage.setItem("distance-bike", 2.1);
    sessionStorage.setItem("distance-walk", 2.4);

var options = [
    { 
        // CO2 emission in g/km, data by: https://www.carbonfootprint.com/ 
        id: "car",
        mode: ["micro-car", "compact-car", "sedan", "suv"],
        gas: ["gasoline", "diesel", "electric"],
        coEmissionGasoline: [ 125.0692, 147.144, 156.4524, 230.2278 ],
        coEmissionDiesel: [ 115.6062, 138.82, 141.0578, 170.4394 ],
        coEmissionElectric: 7.7, // Considering the current mix of energy production in Ontario: https://www.cer-rec.gc.ca/nrg/ntgrtd/mrkt/snpsht/2018/09-01-1hwrnrgprjctsfnncd-eng.html
    }, 
    {
        // Generalized CO2 emission for trucks: https://www.transportenvironment.org/sites/te/files/publications/2015%2009%20TE%20Briefing%20Truck%20CO2%20Too%20big%20to%20ignore_FINAL.pdf
        id: "truck",
        mode: "truck",        
        coEmission: 924
    },
    { 
        // CO2 emission in g/km, TTC as an example: http://www.ttc.ca/PDF/About_the_TTC/Sustainability_Reports/2013_Sustainability_Report.PDF
        id: "pt",
        mode:"publicTransport",
        coEmission: 64
    }, 
    {
        id: "bike",
        mode: "bike",
        coEmission: 0
    }, 
    {
        id: "walk",
        mode: "pedestrian",
        coEmission: 0
    }
]

// Add class "selected-fuel" to the selected fuel type
    // Assumption: we'll be using a Bootstrap button group for this part: https://getbootstrap.com/docs/4.0/components/button-group/
const fuelSelection = document.querySelector("#fuel-selector");
fuelSelection.addEventListener("click", function(e){
    var otherButtons = fuelSelection.childNodes;
    otherButtons[1].classList.remove("selected-fuel"); // Check option: unclick button upon clicking
    otherButtons[3].classList.remove("selected-fuel");
    otherButtons[5].classList.remove("selected-fuel");
    e.target.classList.add("selected-fuel");
})

// Mirror user input
    // Add inline onclick events to the buttons (each button has an id), click will fire addType() function
    // If button is clicked, an object will be added to userInput array
    var userInput = [];
    var inputObject = {};
    // Check if transport mode is already in array, if so, replace previous value
    function validateAndPush(){
        var check = userInput.findIndex(object => inputObject.id === object.id);
        if(check >= 0){
            userInput.splice(check, 1);
        }
        userInput.push(inputObject);
    }

    function addType(e){
        var carEmission;
        var mode = e.target.id;
        switch(mode){
            case "truck":
                distance = sessionStorage.getItem("distance-truck");
                inputObject = {id: mode, em: options[1].coEmission};
                validateAndPush();
                calculateEmission(inputObject);
                break;
            case "walk":
                distance = sessionStorage.getItem("distance-walk");
                inputObject = {id: mode, em: options[4].coEmission};
                validateAndPush();
                calculateEmission(inputObject);
                break;
            case "bike":
                distance = sessionStorage.getItem("distance-bike");
                inputObject = {id: mode, em: options[3].coEmission};
                validateAndPush();
                calculateEmission(inputObject);
                break;
            case "pt":
                distance = sessionStorage.getItem("distance-pt");
                inputObject = {id: mode, em: options[2].coEmission};
                validateAndPush();
                calculateEmission(inputObject);
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
                distance = sessionStorage.getItem("distance-car");
                inputObject = {id: mode, em: carEmission};
                validateAndPush();
                calculateEmission(inputObject);
        }
    }

// Calculate CO2 emissions
var resultsList = [];
var coResult;

function calculateEmission(choice){
    coResult = Math.round(choice.em * distance);
    var id = choice.id;
    var pushResult = {mode: id, co2: coResult};
    document.getElementsByClassName(`${id}CO2`)[0].textContent = coResult;
    document.getElementsByClassName(`${id}Distance`)[0].textContent = distance;
    resultsList.push(pushResult);
}
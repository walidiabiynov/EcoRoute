async function submitSearch() {
    //clear field and grab text
    let searchText = $("#origin-search-field").val();
    $("#origin-search-field").val("");
    const locations = await processSearch(searchText);

    let choices = locations.items;

    if (choices.length === 0) {
        ///No matches found, present to user
        errorModal("There were no matches found, please try again.");
        console.log("No matches found");
        return;
    } else if (choices.length === 1) {
        choice = choices[0];
    } else {
        //HARDCODING CHOICE FOR NOW
        //We could either present a modal or choose based on location
        displayOptionsModal(choices, "origin");
        return;
    }
    saveToSession("origin", choice);
    $("#origin").text(choice.address.label.split(",").slice(0, 2).toString());
    await getAllRoutes()
    disableMissingRoutes()
    //TODO Add second marker to screen, zoom screen in some fashion to see both
    //I might be able to define a bounding box based on the highest and lowest lng and lat coords of each and do that to define the min bounding box of the map
}

function getDirectionsButton() {
    //This needs to be in an async function so I can await, otherwise the page changes and it doesn't actually do the math

    //a check they've input both locations
    if (!(sessionStorage.origin && sessionStorage.destination)) {
        console.log("danger");
        errorModal("Please enter your origin to proceed");
        return
    }

    // Check if at lest one transport option has been selected
    // Save resultsList to sessionStorage
    if (resultsList.length > 0) {
        sessionStorage.setItem("results", JSON.stringify(resultsList));
        window.location.href = "./results.html";
    } else {
        errorModal(
            "Please choose at least one mode of transportation to proceed."
        );
    }
}

async function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async function (position) {
            //TODO put in the call to the generalized function for setting the place name
            position = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            $("#origin").text(`${position.lat}, ${position.lng}`); //TODO Reverse geocode and get location name, fill that here
            saveToSession("origin", { position: position });
            await getAllRoutes()
            disableMissingRoutes()
        });
    } else {
        console.log("Geolocation unsupported by this browser");
        //TODO RETURN MESSAGE IN MODAL TO USER THAT THIS BUTTON DOESN'T FUNCTION
    }
}

function disableMissingRoutes() {
    //Checks what routes weren't possible to map.  It disables the relevant vehicle buttons and adds a message to the user
    //Also rechecks and reenables buttons in case they change their destination and stay on the same page
    const routeMethods = ["car", "bike", "truck", "walk", "pt"];
    var anyMissing = [];
    routeMethods.forEach(function (method) {
        isMissing = !Boolean(loadFromSession(`distance-${method}`));
        console.log("disableMissingRoutes -> isMissing", isMissing, method);

        //Enabling the button in case they've changed their destination and before it was disabled
        if (["walk", "bike", "pt"].includes(method)) {
            if (isMissing) {
                anyMissing.push(keyTranslator(method).toLowerCase());
                $(`#${method}`).prop("disabled", true);
            } else {
                $(`#${method}`).removeAttr("disabled");
            }
        } else if (method === "car") {
            if (isMissing) {
                anyMissing.push(keyTranslator(method).toLowerCase());
                $(`#car`).prop("disabled", true);
                $(`#gasoline`).prop("disabled", true);
                $(`#diesel`).prop("disabled", true);
                $(`#electric`).prop("disabled", true);
            } else {
                $(`#car`).removeAttr("disabled");
                $(`#gasoline`).removeAttr("disabled");
                $(`#diesel`).removeAttr("disabled");
                $(`#electric`).removeAttr("disabled");
            }
        } else if (method === "truck") {
            if (isMissing) {
                anyMissing.push(keyTranslator(method).toLowerCase());
                $(`#truck`).prop("disabled", true);
            } else {
                $(`#truck`).removeAttr("disabled");
            }
        }
        if (anyMissing.length != 0) {
            $("#missing-routes-display").removeClass("d-none");
            $("#missing-routes-display span").text(anyMissing);
        } else if (!$("#missing-routes-display").hasClass("d-none")) {
            $("#missing-routes-display").addClass("d-none");
        }
    });
}

//------------------------------------
validateStorage(["destination"]);
map = instantiateMap();

//Getting the destination from sessionStorage
const destination = loadFromSession("destination");
addMarker(destination.position, endIcon);
map.setCenter(destination.position);
map.setZoom(17);

//populating the text field with the destination
$("#destination").text(
    destination.address.label.split(",").slice(0, 2).toString()
);

//Event listeners for the buttons on the page
$("#search-submit-button").click(function (event) {
    event.preventDefault();
    submitSearch();
});

$("#origin-search-field").on("keypress", function (event) {
    if (event.which === 13) {
        event.preventDefault();
        submitSearch();
    }
});

$("#get-directions-button").click(function (event) {
    //all routes are generated then the next page is moved to
    getDirectionsButton();
});

$("#geolocation-search").click(function (event) {
    //gets the current location of the user
    getLocation();
});

//TODO Catch if there are already values in sessionStorage from past attempts
//TODO catch error values
//TODO catch direct loads of this page
//TODO catch if there is no destination value from the previous page

///THIS IS JUST A TEST

// const options = [
//   {
//       // CO2 emission in g/km, data by: https://www.carbonfootprint.com/
//       id: "car",
//       mode: ["micro-car", "compact-car", "sedan", "suv"],
//       gas: ["gasoline", "diesel", "electric"],
//       coEmissionGasoline: [ 125.0692, 147.144, 156.4524, 230.2278 ],
//       coEmissionDiesel: [ 115.6062, 138.82, 141.0578, 170.4394 ],
//       coEmissionElectric: 7.7, // Considering the current mix of energy production in Ontario: https://www.cer-rec.gc.ca/nrg/ntgrtd/mrkt/snpsht/2018/09-01-1hwrnrgprjctsfnncd-eng.html
//   },
//   {
//       // Generalized CO2 emission for trucks: https://www.transportenvironment.org/sites/te/files/publications/2015%2009%20TE%20Briefing%20Truck%20CO2%20Too%20big%20to%20ignore_FINAL.pdf
//       id: "truck",
//       mode: "truck",
//       coEmission: 924
//   },
//   {
//       // CO2 emission in g/km, TTC as an example: http://www.ttc.ca/PDF/About_the_TTC/Sustainability_Reports/2013_Sustainability_Report.PDF
//       id: "pt",
//       mode:"publicTransport",
//       coEmission: 64
//   },
//   {
//       id: "bike",
//       mode: "bike",
//       coEmission: 0
//   },
//   {
//       id: "walk",
//       mode: "pedestrian",
//       coEmission: 0
//   }
// ]

// $("#choice-buttons").click(function(event){
//   if (event.target.matches('button')){
//     event.target.toggleClass('active')
//   }
// })

async function submitSearch() {
  //clear field and grab text
  let searchText = $("#origin-search-field").val();
  $("#origin-search-field").val("");
  const locations = await processSearch(searchText);

  let choices = locations.items;

  if (choices.length === 0) {
    ///No matches found, present to user
    errorModal('There were no matches found, please try again.')
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
  $('#origin').text(choice.address.label)
  //Location is saved, we can move to next page
  // window.location = "./results.html";

  //TODO Add second marker to screen, zoom screen in some fashion to see both
  //I might be able to define a bounding box based on the highest and lowest lng and lat coords of each and do that to define the min bounding box of the map
}

async function getDirectionsButton() {
  //This needs to be in an async function so I can await, otherwise the page changes and it doesn't actually do the math

  //a check they've input both locations
  if (loadFromSession("destination") && loadFromSession("origin")) {
    await getAllRoutes();
    // Check if at lest one transport option has been selected
    // Save resultsList to sessionStorage
    if(resultsList.length > 0){
        sessionStorage.setItem("results", JSON.stringify(resultsList));
        window.location.href = "./results.html";
    } else {
        errorModal('Please choose at least one mode of transportation to proceed.');
    }
  }
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      //TODO put in the call to the generalized function for setting the place name
      position = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      $("#origin").text(`${position.lat}, ${position.lng}`); //TODO Reverse geocode and get location name, fill that here
      saveToSession("origin", { position: position });
    });
  } else {
    console.log("Geolocation unsupported by this browser");
    //TODO RETURN MESSAGE IN MODAL TO USER THAT THIS BUTTON DOESN'T FUNCTION
  }
}

//------------------------------------
map = instantiateMap();

//Getting the destination from sessionStorage
const destination = loadFromSession("destination");
addMarker(destination.position, endIcon);
map.setCenter(destination.position);
map.setZoom(17);

//populating the text field with the destination
$("#destination").text(destination.address.label);

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

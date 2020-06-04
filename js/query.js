async function submitSearch() {
  console.log(`submitSearch called`);
  //clear field and grab text
  let searchText = $("#origin-search-field").val();
  $("#origin-search-field").val("");
  const locations = await processSearch(searchText);
  console.log("submitSearch -> locations", locations);

  let choices = locations.items;

  if (choices.length === 0) {
    ///No matches found, present to user
    console.log("No matches found");
    return;
  } else if (choices.length > 1) {
    choice = choices[0];
  } else {
    //HARDCODING CHOICE FOR NOW
    //We could either present a modal or choose based on location
    choice = choices[0];
  }
  $("#origin").text(choice.address.label);
  saveToSession("origin", choice);
  console.log("submitSearch -> choice", choice);

  addMarker(destination.position, startIcon);

  //TODO Add second marker to screen, zoom screen in some fashion to see both
  //I might be able to define a bounding box based on the highest and lowest lng and lat coords of each and do that to define the min bounding box of the map
}

function getDirectionsButton() {
  //This needs to be in an async function so I can await, otherwise the page changes and it doesn't actually do the math

  //a check they've input both locations
  if (loadFromSession("destination") && loadFromSession("origin")) {
    console.log(`getting all routes, this will take a moment`);

    getAllRoutes();
    console.log(`route acquired`);
    setTimeout(function(){window.location = "./results.html"}, 3500) //I'm so sorry for this...  I'm still working on async
    // window.location = "./results.html";
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
// console.log(destination)
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
  console.log(`alert alert i have been clicked someone call a doctor`);
  getDirectionsButton();
});

//TODO Fix async issues
//TODO Catch if there are already values in sessionStorage from past attempts
//TODO catch error values
//TODO catch direct loads of this page
//TODO catch if there is no destination value from the previous page

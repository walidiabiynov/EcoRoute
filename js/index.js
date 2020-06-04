//PAGE FOR LOADING FUNCTIONS OF MAIN PAGE

//Event listener for main search field
//STEPS
//Validates search input using geocode
//If there are no options, proceed to next page saving the location
// If there are multiple options, make modal where they choose, then go to next page
async function submitSearch() {
  console.log(`submitSearch called`);
  //clear field and grab text
  let searchText = $("#destination-search-field").val();
  $("#destination-search-field").val("");
  const locations = await processSearch(searchText);

  let choices = locations.items;

  if (choices.length > 1) {
    choice = choices[0];
  } else {
    //HARDCODING CHOICE FOR NOW
    //We could either present a modal or choose based on location
    choice = choices[0];
  }
  saveToSession("destination", choice);
  //Location is saved, we can move to next page
  window.location = "./query.html"
}

instantiateMap();

$("#destination-search-button").click(function (event) {
  event.preventDefault();
  submitSearch();
});

$("#destination-search-field").on("keypress", function (event) {
  if (event.which === 13) {
    event.preventDefault();
    submitSearch();
  }
});

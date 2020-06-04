//PAGE FOR LOADING FUNCTIONS OF MAIN PAGE

//Event listener for main search field
 //STEPS
 //Validates search input using geocode
 //If there are no options, proceed to next page saving the location
 // If there are multiple options, make modal where they choose, then go to next page

instantiateMap()

$('#destination-search-button').click(function(event){
    event.preventDefault()
    submitSearch()
})

$('#destination-search-field').on('keypress', function(event){
    if (event.which === 13) {
        event.preventDefault()
        submitSearch()
    }
})

function submitSearch(){
    console.log(`submitSearch called`)
    //clear field and grab text
    let searchText = $('#destination-search-field').val();
    console.log("submitSearch -> searchText", searchText)
    $('#destination-search-field').val('')
}
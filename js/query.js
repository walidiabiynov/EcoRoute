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











//------------------------------------
map = instantiateMap();

//Getting the destination from sessionStorage
const destination = loadFromSession("destination").position;
addMarker(destination, endIcon);
map.setCenter(destination);
map.setZoom(17);

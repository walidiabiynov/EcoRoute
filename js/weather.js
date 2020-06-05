// Required variables
var weather;

// Getting lat and long from sessionStorage
var storage = JSON.parse(sessionStorage.getItem("destination"));
// var weatherLat = storage.position.lat;
// var weatherLong = storage.position.lng;
var weatherLat = 52.49285;
var weatherLong = 13.43001;

// Fetching the weather
async function fetchWeather(){
    weather = await fetch( `https://api.openweathermap.org/data/2.5/onecall?lat=${weatherLat}&lon=${weatherLong}&exclude=hourly&appid=df7ce556761f98dad07fc817248b0429` ).then( (weather)=>weather.json() )
    renderWeather();
}

// Render weather
function renderWeather(){
    // Determine conditions
    var currentConditionId = weather.current.weather[0].id;
    var currentDescription = weather.current.weather[0].description;
    if(currentConditionId >= 800){
        document.getElementById("condition").textContent = "It looks dry along your route. You might want to consider walking or taking the bike!"
    } else if(currentConditionId >= 700 && currentConditionId < 800){
        document.getElementById("condition").textContent = `Looks like we have some ${currentDescription} on your route. Walking or taking the bike might not be the best idea.`
    } else if(currentConditionId >= 600 && currentConditionId < 700){
        document.getElementById("condition").textContent = `It's cold and there's ${currentDescription} on your route. Take care when walking or taking the bike!`
    } else if(currentConditionId >= 300 && currentConditionId < 600){
        document.getElementById("condition").textContent = `It's wet and there's ${currentDescription} on your route. Walking or taking the bike might not be the best idea.`
    } else if(currentConditionId >= 200 && currentConditionId < 300){
        document.getElementById("condition").textContent = `Oh no, there's a ${currentDescription}. Walking or taking the bike might be very unsafe.`
    } 
    document.getElementById("temperature").textContent = `It's ${(weather.current.temp-273.15).toFixed(1)} °C.`;
    document.getElementById("weather-icon").innerHTML = `<img src="https://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png"  alt="Icon today's weather"/>`
}

fetchWeather();
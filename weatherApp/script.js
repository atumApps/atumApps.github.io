const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "5ee589c4b11f920ac46bdb0bb2c70320"; // API key for OpenWeatherMap API
const MAP_API_KEY = "AIzaSyBnWikKwHMeq0iUgU3YjhRXTNpmFJoFYKs"  // API key for Google maps

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) { // HTML for the main weather card
        // Note: Subtracting zero means that "-0" will become "0", which looks nicer
        console.log(weatherItem)
        return `<div class="details">
                    <h2>${cityName} (${dayOfWeek(weatherItem.dt_txt.split(" ")[0])})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(0) - 0}°C</h6>
                    <h6>Wind: ${(weatherItem.wind.speed).toFixed(0)} m/s</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else { // HTML for the other five day forecast card
        return `<li class="card visible">
                    <h3>${dayOfWeek(weatherItem.dt_txt.split(" ")[0])}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(0) - 0}°C</h6>
                    <h6>Wind: ${(weatherItem.wind.speed).toFixed(0)} m/s</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}

function dayOfWeek(stringDate) {
    const dayAsString = new Date(stringDate).toLocaleString('en-us', {  weekday: 'long' })
    return dayAsString
}

// const getMapImg = (latitude, longitude) => {
//     const latlon = `${latitude},${longitude}`
//     const MAP_API_URL = `https://maps.googleapis.com/maps/api/staticmap?center=${latlon}&zoom=10&size=550x550&sensor=false&key=${MAP_API_KEY}&callback=myMap`;
//     console.log(MAP_API_URL)
// }

// function myMap(latitude, longitude) {
//     var mapProp= {
//       center:new google.maps.LatLng(latitude, longitude),
//       zoom:5,
//     };
//     var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
// }
async function getMapImg(latitude, longitude) {
    const latlon = latitude + "," + longitude
    const MAP_API_URL = "https://maps.googleapis.com/maps/api/staticmap?center=" + latlon + "&zoom=10&size=550x550&sensor=false&key=" + MAP_API_KEY;
    const map = document.querySelector(".map")
    console.log(MAP_API_URL)
    map.setAttribute("src", MAP_API_URL)
}

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    console.log(latitude, longitude)

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        // Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });        
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
        getMapImg(lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; // Get coordinates of user location
            // Get city name from coordinates using reverse geocoding API
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
                getMapImg(latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => { // Show alert if user denied the location permission
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    alert("Sorry, geolocation request denied. Please reset location permissions or type a location in the search bar.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("Sorry, geolocation is unavailable. Please type a location in the search bar.");
                    break;
                case error.TIMEOUT:
                    alert("Sorry, geolocation request timed out. Please type a location in the search bar.");
                    break;
                case error.UNKNOWN_ERROR:
                    alert("Sorry, there was an unknown error with geolocation. Please type a location in the search bar.");
                    break;
            }
        });
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
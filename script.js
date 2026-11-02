const BASE_URL = "https://api.openweathermap.org/data/2.5";

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const errorMsg = document.getElementById("error-msg");
const loader = document.getElementById("loader");
const weatherCard = document.getElementById("weather-card");
const welcome = document.getElementById("welcome");

const cityName = document.getElementById("city-name");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const forecastContainer = document.getElementById("forecast");

searchBtn.addEventListener("click",handleSearch);
cityInput.addEventListener("keydown",(event)=>{
    if(event.key == "Enter"){
        handleSearch();
    }
});

async function handleSearch(){
    errorMsg.classList.add("hidden");
    const city= cityInput.value.trim();

    if(city === ""){
        showError("Please Enter a city name..");
        return;
    }
    // console.log("Searching for:", city);
    await getWeather(city);
}
function showError(message){
    errorMsg.textContent = message;
    errorMsg.classList.remove("hidden");
}

async function getWeather(city) {
    loader.classList.remove("hidden");
    weatherCard.classList.add("hidden");

    try{
        const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);

        if(response.status === 404){
            throw new Error("City is not found. Please Check the Spelling.");
        }
        if(!response.ok){
            throw new Error("Something went wrong. Please try again.");
        }
        const data = await response.json();
            displayWeather(data);
            await getForecast(city);
    }
    catch(error){showError(error.message);
  } finally {
    loader.classList.add("hidden");

    }
}
function displayWeather(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = `${Math.round(data.main.temp)}°C`;
  description.textContent = data.weather[0].description;
  humidity.textContent = `${data.main.humidity}%`;
  wind.textContent = `${data.wind.speed} m/s`;
  pressure.textContent = `${data.main.pressure} hPa`;

  const iconCode = data.weather[0].icon;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
  setBackground(data);
  weatherCard.classList.remove("hidden");
}
function setBackground(data) {
  const condition = data.weather[0].main;
  const isNight = data.weather[0].icon.endsWith("n");

  let theme = "";

  if (isNight) {
    theme = "night";
  } else if (condition === "Clear") {
    theme = "sunny";
  } else if (condition === "Clouds") {
    theme = "cloudy";
  } else if (
    condition === "Rain" ||
    condition === "Drizzle" ||
    condition === "Thunderstorm"
  ) {
    theme = "rainy";
  } else if (condition === "Snow") {
    theme = "snow";
  }

  document.body.className = theme;
}
async function getForecast(city) {
  const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not load the forecast.");
  }

  const data = await response.json();

  const dailyData = data.list.filter((item) =>
    item.dt_txt.includes("12:00:00")
  );

  displayForecast(dailyData);
}
function displayForecast(days) {
  forecastContainer.innerHTML = days
    .map((day) => {
      const date = new Date(day.dt * 1000);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const icon = day.weather[0].icon;
      const temp = Math.round(day.main.temp);

      return `
        <div class="forecast-card">
          <p>${dayName}</p>
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${day.weather[0].description}" />
          <p>${temp}°C</p>
        </div>
      `;
    })
    .join("");
}
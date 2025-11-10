// ==========================================
// WEATHER APP - COMPLETE API INTEGRATION
// ==========================================

// State Management
const state = {
  currentLocation: null,
  weatherData: null,
  units: {
    temperature: 'celsius', // 'celsius' or 'fahrenheit'
    windSpeed: 'kmh',       // 'kmh' or 'mph'
    precipitation: 'mm'      // 'mm' or 'inches'
  },
  selectedDay: 0 // for hourly forecast (0 = today)
};

// Weather code mapping (WMO Weather interpretation codes)
const weatherCodes = {
  0: { description: 'Clear sky', icon: 'icon-sunny.webp' },
  1: { description: 'Mainly clear', icon: 'icon-sunny.webp' },
  2: { description: 'Partly cloudy', icon: 'icon-partly-cloudy.webp' },
  3: { description: 'Overcast', icon: 'icon-overcast.webp' },
  45: { description: 'Foggy', icon: 'icon-fog.webp' },
  48: { description: 'Depositing rime fog', icon: 'icon-fog.webp' },
  51: { description: 'Light drizzle', icon: 'icon-drizzle.webp' },
  53: { description: 'Moderate drizzle', icon: 'icon-drizzle.webp' },
  55: { description: 'Dense drizzle', icon: 'icon-drizzle.webp' },
  61: { description: 'Slight rain', icon: 'icon-rain.webp' },
  63: { description: 'Moderate rain', icon: 'icon-rain.webp' },
  65: { description: 'Heavy rain', icon: 'icon-rain.webp' },
  71: { description: 'Slight snow', icon: 'icon-snow.webp' },
  73: { description: 'Moderate snow', icon: 'icon-snow.webp' },
  75: { description: 'Heavy snow', icon: 'icon-snow.webp' },
  77: { description: 'Snow grains', icon: 'icon-snow.webp' },
  80: { description: 'Slight rain showers', icon: 'icon-rain.webp' },
  81: { description: 'Moderate rain showers', icon: 'icon-rain.webp' },
  82: { description: 'Violent rain showers', icon: 'icon-rain.webp' },
  85: { description: 'Slight snow showers', icon: 'icon-snow.webp' },
  86: { description: 'Heavy snow showers', icon: 'icon-snow.webp' },
  95: { description: 'Thunderstorm', icon: 'icon-storm.webp' },
  96: { description: 'Thunderstorm with slight hail', icon: 'icon-storm.webp' },
  99: { description: 'Thunderstorm with heavy hail', icon: 'icon-storm.webp' }
};

// Day names
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ==========================================
// API FUNCTIONS
// ==========================================

// Geocoding API - Convert city name to coordinates
async function searchLocation(cityName) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
    );
    
    if (!response.ok) throw new Error('Location not found');
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error('Location not found');
    }
    
    return {
      name: data.results[0].name,
      country: data.results[0].country,
      latitude: data.results[0].latitude,
      longitude: data.results[0].longitude
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

// Weather API - Get forecast data
async function getWeatherData(latitude, longitude) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
    );
    
    if (!response.ok) throw new Error('Weather data fetch failed');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Weather API error:', error);
    throw error;
  }
}

// ==========================================
// CONVERSION FUNCTIONS
// ==========================================

function celsiusToFahrenheit(celsius) {
  return (celsius * 9/5) + 32;
}

function fahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5/9;
}

function kmhToMph(kmh) {
  return kmh * 0.621371;
}

function mphToKmh(mph) {
  return mph / 0.621371;
}

function mmToInches(mm) {
  return mm * 0.0393701;
}

function inchesToMm(inches) {
  return inches / 0.0393701;
}

function formatTemperature(temp) {
  if (state.units.temperature === 'fahrenheit') {
    return Math.round(celsiusToFahrenheit(temp));
  }
  return Math.round(temp);
}

function formatWindSpeed(speed) {
  if (state.units.windSpeed === 'mph') {
    return Math.round(kmhToMph(speed));
  }
  return Math.round(speed);
}

function formatPrecipitation(precip) {
  if (state.units.precipitation === 'inches') {
    return mmToInches(precip).toFixed(2);
  }
  return precip.toFixed(1);
}

function getTemperatureUnit() {
  return state.units.temperature === 'celsius' ? '°C' : '°F';
}

function getWindSpeedUnit() {
  return state.units.windSpeed === 'kmh' ? 'km/h' : 'mph';
}

function getPrecipitationUnit() {
  return state.units.precipitation === 'mm' ? 'mm' : 'in';
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateCurrentWeather() {
  const current = state.weatherData.current;
  const location = state.currentLocation;
  
  // Update location and date
  document.querySelector('.cast-text h4').textContent = `${location.name}, ${location.country}`;
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  document.querySelector('.cast-text p').textContent = dateStr;
  
  // Update temperature
  const temp = formatTemperature(current.temperature_2m);
  document.querySelector('.cast-asst h2').textContent = `${temp}°`;
  
  // Update weather icon
  const weatherCode = current.weather_code;
  const iconData = weatherCodes[weatherCode] || weatherCodes[0];
  document.querySelector('.cast-img').src = `assets/images/${iconData.icon}`;
  document.querySelector('.cast-img').alt = iconData.description;
}

function updateWeatherCards() {
  const current = state.weatherData.current;
  
  const cards = document.querySelectorAll('.mood');
  
  // Feels like
  cards[0].querySelector('span').textContent = `${formatTemperature(current.apparent_temperature)}${getTemperatureUnit()}`;
  
  // Humidity
  cards[1].querySelector('span').textContent = `${Math.round(current.relative_humidity_2m)}%`;
  
  // Wind
  cards[2].querySelector('span').textContent = `${formatWindSpeed(current.wind_speed_10m)} ${getWindSpeedUnit()}`;
  
  // Precipitation
  cards[3].querySelector('span').textContent = `${formatPrecipitation(current.precipitation)} ${getPrecipitationUnit()}`;
}

function updateDailyForecast() {
  const daily = state.weatherData.daily;
  const castTabs = document.querySelectorAll('.cast-tabs');
  
  for (let i = 0; i < Math.min(7, castTabs.length); i++) {
    const date = new Date(daily.time[i]);
    const dayName = dayNamesShort[date.getDay()];
    
    const weatherCode = daily.weather_code[i];
    const iconData = weatherCodes[weatherCode] || weatherCodes[0];
    
    const maxTemp = formatTemperature(daily.temperature_2m_max[i]);
    const minTemp = formatTemperature(daily.temperature_2m_min[i]);
    
    castTabs[i].querySelector('p:first-child').textContent = dayName;
    castTabs[i].querySelector('.img-z').src = `assets/images/${iconData.icon}`;
    castTabs[i].querySelector('.img-z').alt = iconData.description;
    
    const tempElements = castTabs[i].querySelectorAll('.tabs p');
    tempElements[0].textContent = `${maxTemp}°`;
    tempElements[1].textContent = `${minTemp}°`;
  }
}

function updateHourlyForecast() {
  const hourly = state.weatherData.hourly;
  const foreTabs = document.querySelectorAll('.fore-tabs');
  
  // Get hours for selected day (state.selectedDay)
  const startHour = state.selectedDay * 24;
  const currentHour = new Date().getHours();
  
  // If today, start from current hour, otherwise start from hour 0
  const actualStartHour = state.selectedDay === 0 ? startHour + currentHour : startHour;
  
  for (let i = 0; i < Math.min(8, foreTabs.length); i++) {
    const hourIndex = actualStartHour + i;
    
    if (hourIndex >= hourly.time.length) break;
    
    const date = new Date(hourly.time[hourIndex]);
    const hour = date.getHours();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    const temp = formatTemperature(hourly.temperature_2m[hourIndex]);
    const weatherCode = hourly.weather_code[hourIndex];
    const iconData = weatherCodes[weatherCode] || weatherCodes[0];
    
    foreTabs[i].querySelector('.time-label').textContent = `${displayHour} ${ampm}`;
    foreTabs[i].querySelector('.temp').textContent = `${temp}°`;
    foreTabs[i].querySelector('.img-x').src = `assets/images/${iconData.icon}`;
    foreTabs[i].querySelector('.img-x').alt = iconData.description;
  }
}

function updateAllUI() {
  if (!state.weatherData || !state.currentLocation) return;
  
  updateCurrentWeather();
  updateWeatherCards();
  updateDailyForecast();
  updateHourlyForecast();
}

// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================

async function handleSearch() {
  const searchInput = document.querySelector('.input');
  const cityName = searchInput.value.trim();
  
  if (!cityName) {
    alert('Please enter a city name');
    return;
  }
  
  try {
    // Show loading state
    searchInput.disabled = true;
    document.querySelector('.skyfall-2 button').textContent = 'Searching...';
    
    // Get location coordinates
    const location = await searchLocation(cityName);
    state.currentLocation = location;
    
    // Get weather data
    const weatherData = await getWeatherData(location.latitude, location.longitude);
    state.weatherData = weatherData;
    
    // Update UI
    updateAllUI();
    
    // Clear search input
    searchInput.value = '';
    
  } catch (error) {
    alert('Location not found. Please try again.');
    console.error(error);
  } finally {
    // Reset button state
    searchInput.disabled = false;
    document.querySelector('.skyfall-2 button').textContent = 'Search';
  }
}

// ==========================================
// UNIT CONVERSION HANDLING
// ==========================================

function handleUnitChange() {
  const temperatureRadios = document.querySelectorAll('input[name="temperature"]');
  const windSpeedRadios = document.querySelectorAll('input[name="windSpeed"]');
  const precipitationRadios = document.querySelectorAll('input[name="precipitation"]');
  
  temperatureRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      state.units.temperature = this.value;
      updateAllUI();
    });
  });
  
  windSpeedRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      state.units.windSpeed = this.value;
      updateAllUI();
    });
  });
  
  precipitationRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      state.units.precipitation = this.value;
      updateAllUI();
    });
  });
}

// ==========================================
// DAY SELECTOR FOR HOURLY FORECAST
// ==========================================

function updateDaySelector() {
  const dateList = document.getElementById('dateList');
  const selectedDay = document.getElementById('selectedDay');
  
  dateList.addEventListener('click', (e) => {
    if (e.target && e.target.matches('li')) {
      const dayName = e.target.textContent;
      selectedDay.textContent = dayName;
      
      // Find which day was selected
      const dayIndex = Array.from(dateList.children).indexOf(e.target);
      state.selectedDay = dayIndex;
      
      // Update hourly forecast
      updateHourlyForecast();
    }
  });
}

// ==========================================
// LOAD DEFAULT CITY ON PAGE LOAD
// ==========================================

async function loadDefaultCity() {
  try {
    // Load Berlin as default
    const location = await searchLocation('Berlin');
    state.currentLocation = location;
    
    const weatherData = await getWeatherData(location.latitude, location.longitude);
    state.weatherData = weatherData;
    
    updateAllUI();
  } catch (error) {
    console.error('Failed to load default city:', error);
  }
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  // Units dropdown toggle
  const unitsToggle = document.getElementById('unitsToggle');
  const dropdownMenu = document.getElementById('dropdownMenu');
  const dropdownIcon = document.getElementById('dropdownIcon');
  
  unitsToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdownMenu.classList.toggle('active');
    dropdownIcon.classList.toggle('rotated');
  });
  
  document.addEventListener('click', function(e) {
    if (!dropdownMenu.contains(e.target) && !unitsToggle.contains(e.target)) {
      dropdownMenu.classList.remove('active');
      dropdownIcon.classList.remove('rotated');
    }
  });
  
  // Search functionality
  const searchButton = document.querySelector('.skyfall-2 button');
  const searchInput = document.querySelector('.input');
  
  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
  
  // Unit conversion handling
  handleUnitChange();
  
  // Day selector for hourly forecast
  updateDaySelector();
  
  // Date selection dropdown
  (function() {
    const dateCast = document.getElementById('dateCast');
    const dateToggle = document.getElementById('dateToggle');
    const dateList = document.getElementById('dateList');
    const selectedDay = document.getElementById('selectedDay');

    function toggleList(show) {
      if (show === undefined) show = dateList.hasAttribute('hidden');
      if (show) {
        dateList.removeAttribute('hidden');
        dateCast.setAttribute('aria-expanded','true');
        const first = dateList.querySelector('li');
        if(first) first.focus();
      } else {
        dateList.setAttribute('hidden','');
        dateCast.setAttribute('aria-expanded','false');
      }
    }

    dateCast.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'li') return;
      toggleList();
    });

    dateList.addEventListener('click', (e) => {
      if (e.target && e.target.matches('li')) {
        selectedDay.textContent = e.target.textContent;
        toggleList(false);
      }
    });

    document.addEventListener('click', (e) => {
      if (!dateCast.contains(e.target)) toggleList(false);
    });

    dateCast.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleList();
      } else if (e.key === 'Escape') {
        toggleList(false);
      }
    });

    dateList.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.matches('li')) {
        selectedDay.textContent = e.target.textContent;
        toggleList(false);
      } else if (e.key === 'Escape') {
        toggleList(false);
        dateCast.focus();
      }
    });
  })();
  
  // Load default city
  loadDefaultCity();
});
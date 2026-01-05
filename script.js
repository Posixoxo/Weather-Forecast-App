// ==========================================
// WEATHER APP - COMPLETE API INTEGRATION
// ==========================================

// State Management
const state = {
  currentLocation: null,
  weatherData: null,
  units: {
    temperature: 'celsius',
    windSpeed: 'kmh',
    precipitation: 'mm'
  },
  selectedDay: 0,
  searchHistory: []
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

const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ==========================================
// API FUNCTIONS
// ==========================================

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

async function getSuggestions(query) {
  if (query.length < 2) return [];
  
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=4&language=en&format=json`
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return [];
    }
    
    return data.results.map(result => ({
      name: result.name,
      country: result.country,
      latitude: result.latitude,
      longitude: result.longitude
    }));
  } catch (error) {
    console.error('Suggestions error:', error);
    return [];
  }
}

// ==========================================
// CONVERSION FUNCTIONS
// ==========================================

function celsiusToFahrenheit(celsius) {
  return (celsius * 9/5) + 32;
}

function kmhToMph(kmh) {
  return kmh * 0.621371;
}

function mmToInches(mm) {
  return mm * 0.0393701;
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
// UI STATE MANAGEMENT
// ==========================================

function showLoadingState() {
  const inProgress = document.querySelector('.in-progress');
  const noResults = document.querySelector('.no-results');
  const weatherContent = document.querySelector('.son-man');
  
  // Show loading indicator with flex to show img and first p
  if (inProgress) {
    inProgress.style.display = 'flex';
    inProgress.style.flexDirection = 'row';
    inProgress.style.alignItems = 'center';
    inProgress.style.gap = '15px';
    inProgress.style.padding = '12px 20px';
    
    // Make sure loading elements are visible
    const img = inProgress.querySelector('img');
    const p = inProgress.querySelector('p:first-of-type');
    if (img) img.style.display = 'block';
    if (p) p.style.display = 'block';
  }
  
  // Hide no results message
  if (noResults) {
    noResults.style.display = 'none';
  }
  
  // Keep weather content visible during loading
  if (weatherContent) {
    weatherContent.style.display = 'display';
  }
}

function hideLoadingState() {
  const inProgress = document.querySelector('.in-progress');
  
  if (inProgress) {
    inProgress.style.display = 'none';
  }
}

function showNoResultsState() {
  const inProgress = document.querySelector('.in-progress');
  const noResults = document.querySelector('.no-results');
  const weatherContent = document.querySelector('.son-man');
  
  // Completely hide in-progress container
  if (inProgress) {
    inProgress.style.display = 'none';
  }
  
  // Show no results message
  if (noResults) {
    noResults.style.display = 'block';
  }
  
  // Hide all weather content
  if (weatherContent) {
    weatherContent.style.display = 'none';
  }
}

function showWeatherContent() {
  const inProgress = document.querySelector('.in-progress');
  const noResults = document.querySelector('.no-results');
  const weatherContent = document.querySelector('.son-man');
  
  // Hide the entire in-progress container
  if (inProgress) {
    inProgress.style.display = 'none';
  }
  
  // Hide no results message
  if (noResults) {
    noResults.style.display = 'none';
  }
  
  // Show weather content
  if (weatherContent) {
    weatherContent.style.removeProperty('display');
  }
}

// ==========================================
// API ERROR STATE
// ==========================================

function createApiErrorContainer() {
  let container = document.querySelector('.center');
  
  if (!container) {
    container = document.createElement('div');
    container.className = 'center';
    container.style.display = 'none';
    container.innerHTML = `
      <img src="assets/images/icon-error.svg" alt="error" class="error">
      <h1>Something went wrong</h1>
      <p>We couldn't connect to the server due to API error. Please try again in a few minutes</p>
      <div class="little-border">
        <img src="assets/images/icon-retry.svg" alt="retry">
        <span>Retry</span>
      </div>
    `;
    
    // Insert after header, before main content
    const main = document.querySelector('main');
    if (main) {
      main.insertBefore(container, main.firstChild);
    } else {
      document.body.appendChild(container);
    }
    
    // Add retry click handler
    const retryButton = container.querySelector('.little-border');
    retryButton.addEventListener('click', handleRetry);
  }
  
  return container;
}

function showApiErrorState() {
  const errorContainer = createApiErrorContainer();
  const weatherContent = document.querySelector('.son-man');
  const searchSection = document.querySelector('.Search');
  const skyfall = document.querySelector('.skyfall');
  const inProgress = document.querySelector('.in-progress');
  const noResults = document.querySelector('.no-results');
  
  // Hide all other content
  if (weatherContent) weatherContent.style.display = 'none';
  if (searchSection) searchSection.style.display = 'none';
  if (skyfall) skyfall.style.display = 'none';
  if (inProgress) inProgress.style.display = 'none';
  if (noResults) noResults.style.display = 'none';
  
  // Show error state
  errorContainer.style.display = 'flex';
}

function hideApiErrorState() {
  const errorContainer = document.querySelector('.center');
  const searchSection = document.querySelector('.Search');
  const skyfall = document.querySelector('.skyfall');
  
  // Hide error state
  if (errorContainer) {
    errorContainer.style.display = 'none';
  }
  
  // Show search section
  if (searchSection) {
    searchSection.style.removeProperty('display');
  }
  
  if (skyfall) {
    skyfall.style.removeProperty('display');
  }
}

async function handleRetry() {
  hideApiErrorState();
  
  // Try to reload the default city
  try {
    showLoadingState();
    showAllContentLoading();
    
    const location = await searchLocation('Berlin');
    state.currentLocation = location;
    
    const weatherData = await getWeatherData(location.latitude, location.longitude);
    state.weatherData = weatherData;
    
    hideLoadingState();
    showWeatherContent();
    updateAllUI();
    hideAllContentLoading();
  } catch (error) {
    hideLoadingState();
    hideAllContentLoading();
    showApiErrorState();
    console.error('Retry failed:', error);
  }
}

// ==========================================
// AUTOCOMPLETE SUGGESTIONS
// ==========================================

function createSuggestionsContainer() {
  let container = document.querySelector('.suggestions-container');
  
  if (!container) {
    container = document.createElement('div');
    container.className = 'suggestions-container';
    container.style.display = 'none';
    
    const skyfall = document.querySelector('.skyfall-2');
    skyfall.appendChild(container);
  }
  
  return container;
}

function showSuggestions(suggestions) {
  const container = createSuggestionsContainer();
  
  if (suggestions.length === 0) {
    hideSuggestions();
    return;
  }
  
  container.innerHTML = '';
  
  suggestions.forEach((suggestion, index) => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.textContent = `${suggestion.name}, ${suggestion.country}`;
    item.dataset.index = index;
    item.dataset.name = suggestion.name;
    item.dataset.country = suggestion.country;
    item.dataset.latitude = suggestion.latitude;
    item.dataset.longitude = suggestion.longitude;
    
    item.addEventListener('click', function() {
      handleSuggestionClick(this);
    });
    
    item.addEventListener('mouseenter', function() {
      document.querySelectorAll('.suggestion-item').forEach(s => s.classList.remove('highlighted'));
      this.classList.add('highlighted');
    });
    
    container.appendChild(item);
  });
  
  container.style.display = 'block';
}

function hideSuggestions() {
  const container = document.querySelector('.suggestions-container');
  if (container) {
    container.style.display = 'none';
    container.innerHTML = '';
  }
}

async function handleSuggestionClick(element) {
  const searchInput = document.querySelector('.input');
  const name = element.dataset.name;
  const country = element.dataset.country;
  const latitude = parseFloat(element.dataset.latitude);
  const longitude = parseFloat(element.dataset.longitude);
  
  searchInput.value = `${name}, ${country}`;
  hideSuggestions();
  
  // Add to search history
  const historyItem = `${name}, ${country}`;
  if (!state.searchHistory.includes(historyItem)) {
    state.searchHistory.unshift(historyItem);
    if (state.searchHistory.length > 10) {
      state.searchHistory.pop();
    }
  }
  
  try {
    showLoadingState();
    searchInput.disabled = true;
    showAllContentLoading();
    
    state.currentLocation = { name, country, latitude, longitude };
    
    const weatherData = await getWeatherData(latitude, longitude);
    state.weatherData = weatherData;
    
    hideLoadingState();
    showWeatherContent();
    updateAllUI();
    hideAllContentLoading();
    
    searchInput.value = '';
    
  } catch (error) {
    hideLoadingState();
    hideAllContentLoading();
    
    // Check if it's an API error (network or server issue)
    if (error.message.includes('fetch') || error.message.includes('API') || error.message.includes('Weather data fetch failed')) {
      showApiErrorState();
    } else {
      showNoResultsState();
    }
    console.error(error);
  } finally {
    searchInput.disabled = false;
  }
}

let suggestionTimeout;

function handleInputChange(input) {
  clearTimeout(suggestionTimeout);
  
  const query = input.value.trim();
  
  if (query.length < 2) {
    hideSuggestions();
    return;
  }
  
  suggestionTimeout = setTimeout(async () => {
    const suggestions = await getSuggestions(query);
    showSuggestions(suggestions);
  }, 300);
}

// ==========================================
// CONTENT LOADING STATES
// ==========================================

function showForecastLoading() {
  const forecast = document.querySelector('.forecast');
  
  if (!forecast.querySelector('.loading-spinner')) {
    forecast.classList.add('forecast-loading');
    
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = `
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p class="loading-text">Loading</p>
    `;
    
    forecast.appendChild(spinner);
  }
}

function hideForecastLoading() {
  const forecast = document.querySelector('.forecast');
  const spinner = forecast.querySelector('.loading-spinner');
  
  if (spinner) {
    spinner.remove();
  }
  
  forecast.classList.remove('forecast-loading');
}

function showMoodTabsLoading() {
  const moodCards = document.querySelectorAll('.mood');
  
  moodCards.forEach(card => {
    const span = card.querySelector('span');
    if (span) {
      span.setAttribute('data-original', span.textContent);
      span.textContent = '-';
      span.classList.add('loading-placeholder');
    }
  });
}

function hideMoodTabsLoading() {
  const moodCards = document.querySelectorAll('.mood');
  
  moodCards.forEach(card => {
    const span = card.querySelector('span');
    if (span && span.hasAttribute('data-original')) {
      span.classList.remove('loading-placeholder');
      span.removeAttribute('data-original');
    }
  });
}

function showDayCastLoading() {
  const castTabs = document.querySelectorAll('.cast-tabs');
  
  castTabs.forEach(tab => {
    tab.classList.add('loading');
  });
}

function hideDayCastLoading() {
  const castTabs = document.querySelectorAll('.cast-tabs');
  
  castTabs.forEach(tab => {
    tab.classList.remove('loading');
  });
}

function showHourlyLoading() {
  // Date list loading
  const dateList = document.getElementById('dateList');
  if (dateList) {
    dateList.classList.add('loading');
    const listItems = dateList.querySelectorAll('li');
    listItems.forEach(li => {
      li.setAttribute('data-original', li.textContent);
      li.textContent = '-';
    });
  }
  
  // Selected day loading
  const selectedDay = document.getElementById('selectedDay');
  if (selectedDay) {
    selectedDay.setAttribute('data-original', selectedDay.textContent);
    selectedDay.textContent = '-';
  }
  
  // Hourly forecast tabs loading
  const foreTabs = document.querySelectorAll('.fore-tabs');
  foreTabs.forEach(tab => {
    tab.classList.add('loading');
  });
}

function hideHourlyLoading() {
  // Date list
  const dateList = document.getElementById('dateList');
  if (dateList) {
    dateList.classList.remove('loading');
    const listItems = dateList.querySelectorAll('li');
    listItems.forEach(li => {
      if (li.hasAttribute('data-original')) {
        li.textContent = li.getAttribute('data-original');
        li.removeAttribute('data-original');
      }
    });
  }
  
  // Selected day
  const selectedDay = document.getElementById('selectedDay');
  if (selectedDay && selectedDay.hasAttribute('data-original')) {
    selectedDay.textContent = selectedDay.getAttribute('data-original');
    selectedDay.removeAttribute('data-original');
  }
  
  // Hourly forecast tabs
  const foreTabs = document.querySelectorAll('.fore-tabs');
  foreTabs.forEach(tab => {
    tab.classList.remove('loading');
  });
}

function showAllContentLoading() {
  showForecastLoading();
  showMoodTabsLoading();
  showDayCastLoading();
  showHourlyLoading();
}

function hideAllContentLoading() {
  hideForecastLoading();
  hideMoodTabsLoading();
  hideDayCastLoading();
  hideHourlyLoading();
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateCurrentWeather() {
  const current = state.weatherData.current;
  const location = state.currentLocation;
  
  document.querySelector('.cast-text h4').textContent = `${location.name}, ${location.country}`;
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  document.querySelector('.cast-text p').textContent = dateStr;
  
  const temp = formatTemperature(current.temperature_2m);
  document.querySelector('.cast-asst h2').textContent = `${temp}°`;
  
  const weatherCode = current.weather_code;
  const iconData = weatherCodes[weatherCode] || weatherCodes[0];
  document.querySelector('.cast-img').src = `assets/images/${iconData.icon}`;
  document.querySelector('.cast-img').alt = iconData.description;
}

function updateWeatherCards() {
  const current = state.weatherData.current;
  const cards = document.querySelectorAll('.mood');
  
  cards[0].querySelector('span').textContent = `${formatTemperature(current.apparent_temperature)}${getTemperatureUnit()}`;
  cards[1].querySelector('span').textContent = `${Math.round(current.relative_humidity_2m)}%`;
  cards[2].querySelector('span').textContent = `${formatWindSpeed(current.wind_speed_10m)} ${getWindSpeedUnit()}`;
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
  
  const startHour = state.selectedDay * 24;
  const currentHour = new Date().getHours();
  
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
    return;
  }
  
  hideSuggestions();
  
  try {
    // Show search loading state
    showLoadingState();
    searchInput.disabled = true;
    
    // Show content loading states
    showAllContentLoading();
    
    // Get location coordinates
    const location = await searchLocation(cityName);
    state.currentLocation = location;
    
    // Add to search history
    const historyItem = `${location.name}, ${location.country}`;
    if (!state.searchHistory.includes(historyItem)) {
      state.searchHistory.unshift(historyItem);
      if (state.searchHistory.length > 10) {
        state.searchHistory.pop();
      }
    }
    
    // Get weather data
    const weatherData = await getWeatherData(location.latitude, location.longitude);
    state.weatherData = weatherData;
    
    // Hide search loading and show weather content
    hideLoadingState();
    showWeatherContent();
    
    // Update UI
    updateAllUI();
    
    // Hide all content loading states
    hideAllContentLoading();
    
    // Clear search input
    searchInput.value = '';
    
  } catch (error) {
    // Hide all loading states on error
    hideLoadingState();
    hideAllContentLoading();
    
    // Check if it's an API error (network or server issue)
    if (error.message.includes('fetch') || error.message.includes('API') || error.message.includes('Weather data fetch failed')) {
      showApiErrorState();
    } else {
      showNoResultsState();
    }
    console.error(error);
  } finally {
    // Re-enable input
    searchInput.disabled = false;
  }
}

// ==========================================
// UNIT CONVERSION HANDLING
// ==========================================

function handleUnitChange() {
  const labels = document.querySelectorAll('.dropdown-section label');
  
  labels.forEach(label => {
    label.addEventListener('click', function(e) {
      e.preventDefault();
      
      const unitType = this.getAttribute('data-unit');
      const unitValue = this.getAttribute('data-value');
      
      const section = this.closest('.dropdown-section');
      section.querySelectorAll('label').forEach(l => l.classList.remove('active'));
      
      this.classList.add('active');
      
      const radio = this.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      
      state.units[unitType] = unitValue;
      
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
      
      const dayIndex = Array.from(dateList.children).indexOf(e.target);
      state.selectedDay = dayIndex;
      
      updateHourlyForecast();
    }
  });
}

// ==========================================
// LOAD DEFAULT CITY ON PAGE LOAD
// ==========================================

async function loadDefaultCity() {
  try {
    // Show content loading for initial load
    showAllContentLoading();
    
    const location = await searchLocation('Berlin');
    state.currentLocation = location;
    
    const weatherData = await getWeatherData(location.latitude, location.longitude);
    state.weatherData = weatherData;
    
    showWeatherContent();
    updateAllUI();
    
    // Hide content loading after data is loaded
    hideAllContentLoading();
  } catch (error) {
    hideAllContentLoading();
    showApiErrorState();
    console.error('Failed to load default city:', error);
  }
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  // Hide loading and no results on page load
  const inProgress = document.querySelector('.in-progress');
  const noResults = document.querySelector('.no-results');
  
  if (inProgress) {
    inProgress.style.display = 'none';
  }
  
  if (noResults) {
    noResults.style.display = 'none';
  }
  
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
  
  // Autocomplete functionality
  searchInput.addEventListener('input', function() {
    handleInputChange(this);
  });
  
  searchInput.addEventListener('focus', function() {
    if (this.value.trim().length >= 2) {
      handleInputChange(this);
    }
  });
  
  // Hide suggestions when clicking outside
  document.addEventListener('click', function(e) {
    const suggestionsContainer = document.querySelector('.suggestions-container');
    if (suggestionsContainer && !searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
      hideSuggestions();
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
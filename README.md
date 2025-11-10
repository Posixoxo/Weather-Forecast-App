# Weather App

A responsive weather application that provides current conditions, 7-day forecasts, and hourly forecasts using the Open-Meteo API.

## Features

- 🔍 Search weather by city name
- 🌡️ Current temperature and weather conditions
- 📊 Additional metrics (feels like, humidity, wind, precipitation)
- 📅 7-day weather forecast
- ⏰ Hourly forecast with day selector
- 🔄 Unit conversion (Celsius/Fahrenheit, km/h/mph, mm/inches)
- 📱 Fully responsive design

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)
- Open-Meteo API (Geocoding & Weather)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/weather-app.git
```

2. Open `index.html` in your browser

No build process or API keys required!

## Usage

- Enter a city name in the search bar
- Click "Search" or press Enter
- View current weather and forecasts
- Use the Units dropdown to change measurement units
- Select different days in the hourly forecast section

## API

This project uses the free [Open-Meteo API](https://open-meteo.com/):
- No API key required
- Geocoding API for location search
- Weather Forecast API for weather data

## Credits

Challenge by [Frontend Mentor](https://www.frontendmentor.io)

## License

MIT License
```

### 3. **Check Your File Structure**
Make sure you have:
```
weather-app/
├── index.html
├── style.css
├── script.js
├── README.md
├── .gitignore
└── assets/
    └── images/
        ├── logo.svg
        ├── icon-*.webp
        └── bg-*.svg



Key Functions:

searchLocation() - Converts city names to coordinates
getWeatherData() - Fetches weather from Open-Meteo API
updateAllUI() - Refreshes all sections with new data
formatTemperature/Wind/Precipitation() - Handles unit conversions.
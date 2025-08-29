// API Configuration
export const API_CONFIG = {
  // Weather API
  WEATHER_API_KEY: '88c65e45d00c940fe57758308ed099bd',
  WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  
  // Google APIs - Using reduced scopes for development
  GOOGLE_CLIENT_ID: '346580462980-facim1lm6d51cauq638vkkqcna1s34gh.apps.googleusercontent.com',
  
  // Google Places API for business search
  GOOGLE_PLACES_API_KEY: 'AIzaSyBAyTInuJnwrR5M9Q61YZ9tVnc9jOMYieY',
};

// Weather API endpoints
export const WEATHER_ENDPOINTS = {
  CURRENT_WEATHER: `${API_CONFIG.WEATHER_BASE_URL}/weather`,
  FORECAST: `${API_CONFIG.WEATHER_BASE_URL}/forecast`,
  GEOCODING: 'http://api.openweathermap.org/geo/1.0/direct',
};

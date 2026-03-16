// API Configuration
// Keys are pulled from environment variables at runtime. In Expo, prefix public
// runtime env vars with EXPO_PUBLIC_. Create a local .env with values like:
// EXPO_PUBLIC_WEATHER_API_KEY=...
// EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=...
// EXPO_PUBLIC_GOOGLE_CLIENT_ID=...
export const API_CONFIG = {
  // Weather API
  WEATHER_API_KEY: process.env.EXPO_PUBLIC_WEATHER_API_KEY ?? '',
  WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',

  // Google APIs
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '',

  // Google Places API for business search
  GOOGLE_PLACES_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? '',
};

// Weather API endpoints
export const WEATHER_ENDPOINTS = {
  CURRENT_WEATHER: `${API_CONFIG.WEATHER_BASE_URL}/weather`,
  FORECAST: `${API_CONFIG.WEATHER_BASE_URL}/forecast`,
  GEOCODING: 'http://api.openweathermap.org/geo/1.0/direct',
};

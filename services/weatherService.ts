import * as Location from 'expo-location';
import { API_CONFIG, WEATHER_ENDPOINTS } from '../config/api';

export interface WeatherData {
  city: string;
  temp: string;
  desc: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: string;
  pressure: number;
  visibility: number;
  sunrise: string;
  sunset: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

// Get current location
export const getCurrentLocation = async (): Promise<LocationData> => {
  try {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    // Reverse geocode to get city name
    const geocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    const city = geocode[0]?.city || 'Unknown City';
    const country = geocode[0]?.country || 'Unknown Country';

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      city,
      country,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    // Return default location (Phoenix, AZ)
    return {
      latitude: 33.4484,
      longitude: -112.0740,
      city: 'Phoenix',
      country: 'US',
    };
  }
};

// Get weather data for a location
export const getWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${WEATHER_ENDPOINTS.CURRENT_WEATHER}?lat=${lat}&lon=${lon}&appid=${API_CONFIG.WEATHER_API_KEY}&units=imperial`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    // Convert temperature to string with °F
    const temp = `${Math.round(data.main.temp)}°F`;
    const feelsLike = `${Math.round(data.main.feels_like)}°F`;

    // Map weather conditions to MaterialCommunityIcons
    const getWeatherIcon = (weatherId: number): string => {
      if (weatherId >= 200 && weatherId < 300) return 'weather-lightning';
      if (weatherId >= 300 && weatherId < 400) return 'weather-rainy';
      if (weatherId >= 500 && weatherId < 600) return 'weather-pouring';
      if (weatherId >= 600 && weatherId < 700) return 'weather-snowy';
      if (weatherId >= 700 && weatherId < 800) return 'weather-fog';
      if (weatherId === 800) return 'weather-sunny';
      if (weatherId >= 801 && weatherId < 900) return 'weather-cloudy';
      return 'weather-cloudy';
    };

    // Format sunrise/sunset times
    const formatTime = (timestamp: number): string => {
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    return {
      city: data.name,
      temp,
      desc: data.weather[0].description,
      icon: getWeatherIcon(data.weather[0].id),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      feelsLike,
      pressure: data.main.pressure,
      visibility: Math.round(data.visibility / 1000), // Convert to km
      sunrise: formatTime(data.sys.sunrise),
      sunset: formatTime(data.sys.sunset),
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return default weather data
    return {
      city: 'Phoenix',
      temp: '107°F',
      desc: 'Sunny',
      icon: 'weather-sunny',
      humidity: 25,
      windSpeed: 5,
      feelsLike: '110°F',
      pressure: 1013,
      visibility: 10,
      sunrise: '5:30 AM',
      sunset: '7:30 PM',
    };
  }
};

// Get weather data for current location
export const getCurrentWeather = async (): Promise<WeatherData> => {
  try {
    const location = await getCurrentLocation();
    return await getWeatherData(location.latitude, location.longitude);
  } catch (error) {
    console.error('Error getting current weather:', error);
    // Return default weather data
    return {
      city: 'Phoenix',
      temp: '107°F',
      desc: 'Sunny',
      icon: 'weather-sunny',
      humidity: 25,
      windSpeed: 5,
      feelsLike: '110°F',
      pressure: 1013,
      visibility: 10,
      sunrise: '5:30 AM',
      sunset: '7:30 PM',
    };
  }
};

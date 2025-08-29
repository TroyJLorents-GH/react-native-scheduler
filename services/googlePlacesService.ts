import { API_CONFIG } from '../config/api';

export interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  vicinity?: string;
}

export interface GooglePlacesAutocompleteResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

export interface GooglePlacesSearchResult {
  results: GooglePlace[];
  status: string;
  next_page_token?: string;
}

class GooglePlacesService {
  private apiKey = API_CONFIG.GOOGLE_PLACES_API_KEY;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  // Search for places with autocomplete
  async searchAutocomplete(query: string, latitude?: number, longitude?: number): Promise<GooglePlacesAutocompleteResult[]> {
    try {
      let url = `${this.baseUrl}/autocomplete/json?input=${encodeURIComponent(query)}&key=${this.apiKey}&types=establishment`;
      
      // Add location bias if coordinates provided
      if (latitude && longitude) {
        url += `&location=${latitude},${longitude}&radius=50000`; // 50km radius
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.predictions;
      } else {
        console.error('Google Places Autocomplete error:', data.status, data.error_message);
        return [];
      }
    } catch (error) {
      console.error('Error in Google Places Autocomplete:', error);
      return [];
    }
  }

  // Search for nearby places
  async searchNearby(query: string, latitude: number, longitude: number, radius: number = 50000): Promise<GooglePlace[]> {
    try {
      const url = `${this.baseUrl}/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${encodeURIComponent(query)}&type=establishment&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data: GooglePlacesSearchResult = await response.json();
      
      if (data.status === 'OK') {
        return data.results;
      } else {
        console.error('Google Places Nearby Search error:', data.status);
        return [];
      }
    } catch (error) {
      console.error('Error in Google Places Nearby Search:', error);
      return [];
    }
  }

  // Get place details
  async getPlaceDetails(placeId: string): Promise<GooglePlace | null> {
    try {
      const url = `${this.baseUrl}/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,geometry,types,rating,user_ratings_total,vicinity&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.result;
      } else {
        console.error('Google Places Details error:', data.status);
        return null;
      }
    } catch (error) {
      console.error('Error in Google Places Details:', error);
      return null;
    }
  }

  // Search for text-based places
  async searchText(query: string, latitude?: number, longitude?: number): Promise<GooglePlace[]> {
    try {
      let url = `${this.baseUrl}/textsearch/json?query=${encodeURIComponent(query)}&key=${this.apiKey}&type=establishment`;
      
      // Add location bias if coordinates provided
      if (latitude && longitude) {
        url += `&location=${latitude},${longitude}&radius=50000`;
      }
      
      const response = await fetch(url);
      const data: GooglePlacesSearchResult = await response.json();
      
      if (data.status === 'OK') {
        return data.results;
      } else {
        console.error('Google Places Text Search error:', data.status);
        return [];
      }
    } catch (error) {
      console.error('Error in Google Places Text Search:', error);
      return [];
    }
  }
}

export const googlePlacesService = new GooglePlacesService();

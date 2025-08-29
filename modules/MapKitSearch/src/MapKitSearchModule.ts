import { requireNativeModule } from 'expo-modules-core';

const MapKitSearchModule = requireNativeModule('MapKitSearch');

export interface SearchCompletion {
  title: string;
  subtitle: string;
  type: 'completion';
}

export interface SearchResult {
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  category: string;
  distance: number;
}

export default MapKitSearchModule as {
  searchCompletions(query: string): Promise<SearchCompletion[]>;
  searchNearby(query: string, latitude: number, longitude: number): Promise<SearchResult[]>;
};

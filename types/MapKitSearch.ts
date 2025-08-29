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

export interface PlacemarkResult {
  name: string;
  title: string;
  subtitle: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface MapKitSearchModule {
  searchCompletions(query: string): Promise<SearchCompletion[]>;
  searchNearby(query: string, latitude: number, longitude: number): Promise<SearchResult[]>;
  getPlacemarkForCoordinate(latitude: number, longitude: number): Promise<PlacemarkResult>;
}

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Linking, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

interface AppleMapViewProps {
  onLocationSelect?: (location: { latitude: number; longitude: number; address: string }) => void;
  selectedLocation?: { latitude: number; longitude: number; address: string } | null;
  initialLocation?: { latitude: number; longitude: number };
}

interface SearchResultItem {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'business' | 'address';
  distance?: number;
}

export default function AppleMapView({ onLocationSelect, selectedLocation, initialLocation }: AppleMapViewProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      // Set initial map region to current location
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  // Update map region when initialLocation changes
  useEffect(() => {
    if (initialLocation) {
      setMapRegion({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [initialLocation]);

  const handleUseCurrentLocation = async () => {
    if (location) {
      try {
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        const address = addressResponse[0]
          ? `${addressResponse[0].street || 'Current Location'}, ${addressResponse[0].city || ''}, ${addressResponse[0].region || ''}`
          : 'Current Location';

        const selectedLoc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address,
        };

        onLocationSelect?.(selectedLoc);
        
        // Update map region
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error('Error getting address:', error);
        Alert.alert('Error', 'Could not get current location address');
      }
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    try {
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = addressResponse[0]
        ? `${addressResponse[0].street || 'Selected Location'}, ${addressResponse[0].city || ''}, ${addressResponse[0].region || ''}`
        : 'Selected Location';

      const selectedLoc = {
        latitude,
        longitude,
        address,
      };

      onLocationSelect?.(selectedLoc);
    } catch (error) {
      console.error('Error getting address for selected location:', error);
    }
  };

  const openDirections = () => {
    if (selectedLocation) {
      // Open Apple Maps with directions
      const url = `http://maps.apple.com/?daddr=${selectedLocation.latitude},${selectedLocation.longitude}`;
      Linking.openURL(url);
    }
  };

  const searchLocations = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const currentLocation = location || await Location.getCurrentPositionAsync({});
      
      // Get current city for better search results
      const currentAddress = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      
      const currentCity = currentAddress[0]?.city || '';
      
      // Create search terms with city
      let searchTerms = [query];
      if (currentCity) {
        searchTerms.push(`${query}, ${currentCity}`);
      }

      const allResults: SearchResultItem[] = [];
      
      for (const searchTerm of searchTerms) {
        try {
          const geocodeResult = await Location.geocodeAsync(searchTerm);
          
          // Convert results to SearchResult format with distance calculation
          for (const result of geocodeResult.slice(0, 5)) {
            try {
              const addressResponse = await Location.reverseGeocodeAsync({
                latitude: result.latitude,
                longitude: result.longitude,
              });

              if (addressResponse[0]) {
                // Calculate distance from current location
                const distance = calculateDistance(
                  currentLocation.coords.latitude,
                  currentLocation.coords.longitude,
                  result.latitude,
                  result.longitude
                );

                const street = addressResponse[0].street || '';
                const city = addressResponse[0].city || '';
                const region = addressResponse[0].region || '';
                
                const address = street 
                  ? `${street}, ${city}, ${region}`
                  : `${city}, ${region}`;
                
                // Check if this location already exists (avoid duplicates)
                const existingResult = allResults.find(r => 
                  Math.abs(r.latitude - result.latitude) < 0.001 && 
                  Math.abs(r.longitude - result.longitude) < 0.001
                );
                
                if (!existingResult) {
                  allResults.push({
                    id: `${result.latitude}-${result.longitude}-${Date.now()}`,
                    name: query,
                    address: `${address} (${formatDistance(distance)})`,
                    latitude: result.latitude,
                    longitude: result.longitude,
                    type: street ? 'business' : 'address',
                    distance: distance,
                  });
                }
              }
            } catch (error) {
              console.error('Error getting address for result:', error);
            }
          }
        } catch (error) {
          console.error('Error searching for term:', searchTerm, error);
        }
      }

      // Sort by distance and limit results
      const sortedResults = allResults
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, 8);

      setSearchResults(sortedResults);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    // Clear previous search timeout
    if ((global as any).searchTimeout) {
      clearTimeout((global as any).searchTimeout);
    }
    
    // Debounce search to reduce API calls
    (global as any).searchTimeout = setTimeout(() => {
      searchLocations(text);
    }, 500);
  };

  const selectSearchResult = (result: SearchResultItem) => {
    const selectedLoc = {
      latitude: result.latitude,
      longitude: result.longitude,
      address: result.address,
    };

    onLocationSelect?.(selectedLoc);
    setSearchQuery(result.name);
    setSearchResults([]);
    
    // Update map region to show the selected location
    setMapRegion({
      latitude: result.latitude,
      longitude: result.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const renderSearchResult = ({ item }: { item: SearchResultItem }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => selectSearchResult(item)}
    >
      <Ionicons 
        name={item.type === 'business' ? 'business' : 'location'} 
        size={20} 
        color="#007AFF" 
      />
      <View style={styles.searchResultText}>
        <Text style={styles.searchResultName}>{item.name}</Text>
        <Text style={styles.searchResultAddress}>{item.address}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#8e8e93" />
    </TouchableOpacity>
  );

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 5280)} ft away`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)} miles away`;
    } else {
      return `${Math.round(distance)} miles away`;
    }
  };

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => setErrorMsg(null)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Services</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a place or address..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {isSearching && <Ionicons name="refresh" size={20} color="#666" style={styles.loadingIcon} />}
      </View>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <View style={styles.searchResultsHeader}>
            <Text style={styles.searchResultsTitle}>
              {searchQuery} Nearby
            </Text>
          </View>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            style={styles.searchResultsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          />
        </View>
      )}

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* Show search result pins */}
          {searchResults.map((result) => (
            <Marker
              key={result.id}
              coordinate={{
                latitude: result.latitude,
                longitude: result.longitude,
              }}
              title={result.name}
              description={result.address}
              pinColor={result.type === 'business' ? 'red' : 'blue'}
            />
          ))}
          
          {/* Show selected location pin */}
          {selectedLocation && (
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              title="Selected Location"
              description={selectedLocation.address}
              pinColor="green"
            />
          )}
        </MapView>
      </View>

      {/* Location Options */}
      <View style={styles.locationContainer}>
        {selectedLocation ? (
          <View style={styles.selectedLocation}>
            <Ionicons name="location" size={20} color="#007AFF" />
            <View style={styles.selectedLocationText}>
              <Text style={styles.locationText}>{selectedLocation.address}</Text>
              <Text style={styles.coordinatesText}>
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.locationButtons}>
              <TouchableOpacity style={styles.directionsButton} onPress={openDirections}>
                <Ionicons name="navigate" size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={() => {
                  Alert.alert('Location Confirmed', `Location saved: ${selectedLocation.address}`);
                }}
              >
                <Text style={styles.confirmButtonText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.locationOptions}>
            <TouchableOpacity style={styles.locationButton} onPress={handleUseCurrentLocation}>
              <Ionicons name="location" size={20} color="#007AFF" />
              <Text style={styles.buttonText}>Use Current Location</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>or</Text>
            
            <Text style={styles.tapInstruction}>Tap on the map to select a location</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1c1c1e',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1c1c1e',
  },
  searchButton: {
    padding: 8,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: {
    flex: 1,
  },
  locationContainer: {
    alignItems: 'center',
  },
  locationOptions: {
    width: '100%',
    alignItems: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    width: '100%',
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1c1c1e',
  },
  orText: {
    color: '#666',
    fontSize: 14,
    marginVertical: 8,
  },
  tapInstruction: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  selectedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    width: '100%',
  },
  selectedLocationText: {
    flex: 1,
    marginLeft: 12,
  },
  locationText: {
    fontSize: 16,
    color: '#1c1c1e',
    fontWeight: '600',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  directionsButton: {
    padding: 8,
  },
  locationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchTips: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  searchResultText: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  searchResultAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  searchResultDistance: {
    marginLeft: 10,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
  },
  searchIcon: {
    marginRight: 10,
  },
  loadingIcon: {
    marginLeft: 10,
  },
  searchResultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    marginBottom: 12,
  },
  searchResultsHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  searchResultsList: {
    // No specific styles needed, FlatList handles its own styling
  },
});

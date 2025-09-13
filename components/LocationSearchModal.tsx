import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Keyboard,
    Modal,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocompleteResult, googlePlacesService } from '../services/googlePlacesService';

interface LocationSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
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
  icon?: string;
}

export default function LocationSearchModal({ 
  visible, 
  onClose, 
  onLocationSelect, 
  initialLocation 
}: LocationSearchModalProps) {
  const isMountedRef = useRef(true);
  const mapRef = useRef<MapView | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [completions, setCompletions] = useState<GooglePlacesAutocompleteResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SearchResultItem | null>(null);
  const [recentLocations, setRecentLocations] = useState<SearchResultItem[]>([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    if (visible) {
      // Start a new Places session when modal becomes visible
      try { googlePlacesService.newSessionToken(); } catch {}
      getCurrentLocation();
    }
    // load recent locations
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('recent_locations');
        if (raw) setRecentLocations(JSON.parse(raw));
      } catch {}
    })();
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      isMountedRef.current = false;
      if ((global as any).searchTimeout) {
        clearTimeout((global as any).searchTimeout);
      }
      try { googlePlacesService.clearSessionToken(); } catch {}
      showSub.remove();
      hideSub.remove();
    };
  }, [visible]);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to search nearby places.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      // Set map region to current location
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const searchAutocomplete = async (query: string) => {
    if (query.trim().length < 1) {
      setCompletions([]);
      setErrorMsg(null);
      return;
    }

    try {
      const currentLocation = location || await Location.getCurrentPositionAsync({});
      const results = await googlePlacesService.searchAutocomplete(
        query,
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      setCompletions(results);
      setErrorMsg(null);
    } catch (error: any) {
      setErrorMsg('Location autocomplete unavailable. Check API key restrictions.');
      setCompletions([]);
    }
  };

  const searchLocations = async (query: string) => {
    if (query.trim().length < 1) {
      setSearchResults([]);
      setErrorMsg(null);
      return;
    }

    setIsSearching(true);
    try {
      const currentLocation = location || await Location.getCurrentPositionAsync({});
      
      // Use Google Places API for real business search
      const places = await googlePlacesService.searchText(
        query,
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );

      console.log('Google Places results:', places);

      let mappedResults: SearchResultItem[] = places.map((place, index) => {
        const distance = calculateDistance(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        );

        // Determine icon based on place types
        const icon = place.types.includes('gym') || place.types.includes('health') ? 'fitness' :
                    place.types.includes('restaurant') || place.types.includes('food') ? 'restaurant' :
                    place.types.includes('lodging') || place.types.includes('hotel') ? 'bed' :
                    place.types.includes('cafe') || place.types.includes('coffee') ? 'cafe' :
                    'business';

        return {
          id: place.place_id,
          name: place.name,
          address: `${place.formatted_address} (${formatDistance(distance)})`,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          type: 'business',
          distance: distance,
          icon: icon
        };
      });

      // Fallback: if Google returns no results (e.g., key restricted), try plain geocoding
      if (mappedResults.length === 0) {
        try {
          const geos = await Location.geocodeAsync(query);
          if (geos && geos[0]) {
            const g = geos[0];
            mappedResults = [{
              id: `${g.latitude}-${g.longitude}`,
              name: query,
              address: query,
              latitude: g.latitude!,
              longitude: g.longitude!,
              type: 'address'
            }];
          }
        } catch {}
      }

      console.log('Converted search results:', mappedResults);
      // Sort results by distance (closest first)
      const sortedResults = mappedResults.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setSearchResults(sortedResults);
      // Clear completions when we have search results
      setCompletions([]);
    } catch (error) {
      setErrorMsg('Search failed. Falling back to basic geocoding.');
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
    
    // Get autocomplete immediately
    searchAutocomplete(text);
    
    // Debounce full search
    (global as any).searchTimeout = setTimeout(() => {
      searchLocations(text);
    }, 500);
  };

  const selectCompletion = async (completion: GooglePlacesAutocompleteResult) => {
    setSearchQuery(completion.structured_formatting.main_text);
    setCompletions([]);
    
    // Get place details and perform search
    try {
      const placeDetails = await googlePlacesService.getPlaceDetails(completion.place_id);
      if (placeDetails) {
        const currentLocation = location || await Location.getCurrentPositionAsync({});
        const distance = calculateDistance(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          placeDetails.geometry.location.lat,
          placeDetails.geometry.location.lng
        );

        const icon = placeDetails.types.includes('gym') || placeDetails.types.includes('health') ? 'fitness' :
                    placeDetails.types.includes('restaurant') || placeDetails.types.includes('food') ? 'restaurant' :
                    placeDetails.types.includes('lodging') || placeDetails.types.includes('hotel') ? 'bed' :
                    placeDetails.types.includes('cafe') || placeDetails.types.includes('coffee') ? 'cafe' :
                    'business';

        const searchResult: SearchResultItem = {
          id: placeDetails.place_id,
          name: placeDetails.name,
          address: `${placeDetails.formatted_address} (${formatDistance(distance)})`,
          latitude: placeDetails.geometry.location.lat,
          longitude: placeDetails.geometry.location.lng,
          type: 'business',
          distance: distance,
          icon: icon
        };

        setSearchResults([searchResult]);
        
        // Dismiss keyboard and fit map to show both user and selected place
        Keyboard.dismiss();
        const coords = [
          { latitude: placeDetails.geometry.location.lat, longitude: placeDetails.geometry.location.lng },
          { latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude },
        ];
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 60, left: 60, right: 60, bottom: 60 },
          animated: true,
        });
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      // Fallback to text search
      await searchLocations(completion.structured_formatting.main_text);
    }
  };

  const selectSearchResult = (result: SearchResultItem) => {
    setSelectedLocation(result);
    setSearchQuery(result.name);
    setSearchResults([]);
    setCompletions([]);
    
    // Dismiss keyboard and fit map to show both user and selected place
    Keyboard.dismiss();
    if (location) {
      const coords = [
        { latitude: result.latitude, longitude: result.longitude },
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
      ];
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 60, left: 60, right: 60, bottom: 60 },
        animated: true,
      });
    } else {
      setMapRegion({
        latitude: result.latitude,
        longitude: result.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleMapPress = async (event: any) => {
    // If user is trying to dismiss the keyboard, do not set a point
    if (keyboardVisible) {
      Keyboard.dismiss();
      return;
    }
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    try {
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = addressResponse[0]
        ? `${addressResponse[0].street || 'Selected Location'}, ${addressResponse[0].city || ''}, ${addressResponse[0].region || ''}`
        : 'Selected Location';

      setSelectedLocation({
        id: `${latitude}-${longitude}`,
        name: addressResponse[0]?.name || 'Selected Location',
        address,
        latitude,
        longitude,
        type: 'address',
      });
    } catch (error) {
      console.error('Error getting address for selected location:', error);
    }
  };

  const handleConfirmLocation = () => {
    try {
      if (!selectedLocation) {
        Alert.alert('No Location Selected', 'Please select a location first.');
        return;
      }

      const { latitude, longitude, address } = selectedLocation;
      if (!isFinite(latitude) || !isFinite(longitude)) {
        Alert.alert('Invalid Location', 'This place returned invalid coordinates. Please pick another.');
        return;
      }

      console.log('Confirming location:', selectedLocation);
      // Call back first, then close on the next tick to avoid UI race conditions
      onLocationSelect({ latitude, longitude, address });
      // persist recent locations (max 5, unique by lat/lng)
      try {
        const next: SearchResultItem = {
          id: `${latitude}-${longitude}`,
          name: selectedLocation.name || 'Location',
          address,
          latitude,
          longitude,
          type: 'address',
        };
        const deduped = [next, ...recentLocations]
          .filter((v, i, a) => a.findIndex(x => Math.abs(x.latitude - v.latitude) < 1e-6 && Math.abs(x.longitude - v.longitude) < 1e-6) === i)
          .slice(0, 5);
        setRecentLocations(deduped);
        AsyncStorage.setItem('recent_locations', JSON.stringify(deduped));
      } catch {}
      setTimeout(() => {
        if (isMountedRef.current) {
          try { onClose(); } catch {}
        }
      }, 0);
    } catch (error) {
      console.error('Error confirming location:', error);
      Alert.alert('Error', 'There was an error selecting the location. Please try again.');
    }
  };

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

  const getIconName = (icon?: string) => {
    switch (icon) {
      case 'fitness': return 'fitness';
      case 'cafe': return 'cafe';
      case 'restaurant': return 'restaurant';
      case 'bed': return 'bed';
      default: return 'location';
    }
  };

  const renderCompletion = ({ item }: { item: GooglePlacesAutocompleteResult }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => selectCompletion(item)}
    >
      <Ionicons name="search" size={20} color="#007AFF" />
      <View style={styles.searchResultText}>
        <Text style={styles.searchResultName}>{item.structured_formatting.main_text}</Text>
        <Text style={styles.searchResultAddress}>{item.structured_formatting.secondary_text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#8e8e93" />
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }: { item: SearchResultItem }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => selectSearchResult(item)}
    >
      <Ionicons 
        name={getIconName(item.icon) as any} 
        size={20} 
        color="#007AFF" 
      />
      <View style={styles.searchResultText}>
        <Text style={styles.searchResultName}>{item.name}</Text>
        <Text style={styles.searchResultAddress}>
          {item.address}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#8e8e93" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
            <Text style={styles.backButtonText}>Details</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Location</Text>
          <TouchableOpacity 
            style={[styles.confirmButton, !selectedLocation && styles.confirmButtonDisabled]} 
            onPress={handleConfirmLocation}
            disabled={!selectedLocation}
          >
            <Text style={[styles.confirmButtonText, !selectedLocation && styles.confirmButtonTextDisabled]}>
              Done
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search or Enter Address"
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={() => {
              searchLocations(searchQuery);
              Keyboard.dismiss();
            }}
            autoFocus={true}
          />
          {isSearching && <Ionicons name="refresh" size={20} color="#666" style={styles.loadingIcon} />}
        </View>
        {errorMsg && (
          <Text style={{ color: '#ff3b30', marginHorizontal: 16, marginTop: -6 }}>
            {errorMsg}
          </Text>
        )}

        {/* Recent locations hidden per request */}

        {/* Completions */}
        {completions.length > 0 && searchResults.length === 0 && (
          <View style={styles.searchResultsContainer}>
            <FlatList
              data={completions}
              renderItem={renderCompletion}
              keyExtractor={(item) => item.place_id}
              style={styles.searchResultsList}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              style={styles.searchResultsList}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={(ref) => { mapRef.current = ref; }}
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

        {/* Selected Location Info */}
        {selectedLocation && (
          <View style={styles.selectedLocationContainer}>
            <Ionicons name="location" size={20} color="#007AFF" />
            <View style={styles.selectedLocationText}>
              <Text style={styles.selectedLocationName}>{selectedLocation.name}</Text>
              <Text style={styles.selectedLocationAddress}>{selectedLocation.address}</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 17,
    color: '#007AFF',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  confirmButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  confirmButtonDisabled: {
    backgroundColor: '#e5e5e5',
  },
  confirmButtonText: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '600',
  },
  confirmButtonTextDisabled: {
    color: '#8e8e93',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#000',
  },
  loadingIcon: {
    marginLeft: 8,
  },
  searchResultsContainer: {
    maxHeight: 300,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  searchResultsList: {
    backgroundColor: '#fff',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  searchResultText: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultName: {
    fontSize: 17,
    color: '#000',
    fontWeight: '500',
  },
  searchResultAddress: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f2f2f7',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
  },
  selectedLocationText: {
    flex: 1,
    marginLeft: 12,
  },
  selectedLocationName: {
    fontSize: 17,
    color: '#000',
    fontWeight: '600',
  },
  selectedLocationAddress: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 2,
  },
});

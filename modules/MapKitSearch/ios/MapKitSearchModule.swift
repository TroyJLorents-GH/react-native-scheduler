import ExpoModulesCore
import MapKit

public class MapKitSearchModule: Module {
    public func definition() -> ModuleDefinition {
        Name("MapKitSearch")
        
        AsyncFunction("searchCompletions") { (query: String, promise: Promise) in
            let completer = MKLocalSearchCompleter()
            completer.queryFragment = query
            completer.resultTypes = .pointOfInterest
            
            // Store the promise to resolve later
            self.searchCompleters[completer] = promise
            
            completer.delegate = self
        }
        
        AsyncFunction("searchNearby") { (query: String, latitude: Double, longitude: Double, promise: Promise) in
            let request = MKLocalSearchRequest()
            request.naturalLanguageQuery = query
            request.resultTypes = .pointOfInterest
            
            // Set the region around the current location
            let region = MKCoordinateRegion(
                center: CLLocationCoordinate2D(latitude: latitude, longitude: longitude),
                span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
            )
            request.region = region
            
            let search = MKLocalSearch(request: request)
            search.start { response, error in
                if let error = error {
                    promise.reject("SEARCH_ERROR", error.localizedDescription)
                    return
                }
                
                guard let response = response else {
                    promise.reject("NO_RESPONSE", "No search response received")
                    return
                }
                
                let results = response.mapItems.map { item in
                    return [
                        "title": item.name ?? "",
                        "subtitle": item.placemark.title ?? "",
                        "latitude": item.placemark.coordinate.latitude,
                        "longitude": item.placemark.coordinate.longitude,
                        "address": [
                            "street": item.placemark.thoroughfare ?? "",
                            "city": item.placemark.locality ?? "",
                            "state": item.placemark.administrativeArea ?? "",
                            "zipCode": item.placemark.postalCode ?? ""
                        ],
                        "category": item.pointOfInterestCategory?.rawValue ?? "",
                        "distance": self.calculateDistance(
                            from: CLLocationCoordinate2D(latitude: latitude, longitude: longitude),
                            to: item.placemark.coordinate
                        )
                    ]
                }
                
                promise.resolve(results)
            }
        }
    }
    
    // Store active completers to handle delegate callbacks
    private var searchCompleters: [MKLocalSearchCompleter: Promise] = [:]
    
    // Calculate distance between two coordinates
    private func calculateDistance(from: CLLocationCoordinate2D, to: CLLocationCoordinate2D) -> Double {
        let fromLocation = CLLocation(latitude: from.latitude, longitude: from.longitude)
        let toLocation = CLLocation(latitude: to.latitude, longitude: to.longitude)
        return fromLocation.distance(from: toLocation) / 1609.34 // Convert meters to miles
    }
}

// MARK: - MKLocalSearchCompleterDelegate
extension MapKitSearchModule: MKLocalSearchCompleterDelegate {
    public func completerDidUpdateResults(_ completer: MKLocalSearchCompleter) {
        guard let promise = searchCompleters[completer] else { return }
        
        let results = completer.results.map { result in
            return [
                "title": result.title,
                "subtitle": result.subtitle,
                "type": "completion"
            ]
        }
        
        promise.resolve(results)
        searchCompleters.removeValue(forKey: completer)
    }
    
    public func completer(_ completer: MKLocalSearchCompleter, didFailWithError error: Error) {
        guard let promise = searchCompleters[completer] else { return }
        
        promise.reject("COMPLETION_ERROR", error.localizedDescription)
        searchCompleters.removeValue(forKey: completer)
    }
}

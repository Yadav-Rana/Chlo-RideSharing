import {useState, useEffect, useCallback, useRef} from "react";
import {
  GoogleMap,
  DirectionsRenderer,
  InfoWindow,
} from "@react-google-maps/api";

// Import the Marker component for backward compatibility
// Note: We're still using the deprecated Marker component for now
// TODO: Migrate to AdvancedMarkerElement in the future
import {Marker} from "@react-google-maps/api";
import {getCurrentLocation} from "../utils/mapUtils";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  fullscreenControl: true,
  streetViewControl: true,
  mapTypeControl: true,
};

const Map = ({
  pickupLocation,
  destinationLocation,
  riderLocation,
  passengerLocation,
  showDirections = false,
  rideStatus,
  onMapLoad,
  className = "",
}) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [map, setMap] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  // Check if Google Maps is loaded
  const [isLoaded, setIsLoaded] = useState(!!window.google?.maps);
  const [loadError, setLoadError] = useState(null);

  // Check if Google Maps is loaded
  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true);
    } else {
      // If not loaded yet, check again in 500ms
      const checkGoogleMaps = setInterval(() => {
        if (window.google?.maps) {
          setIsLoaded(true);
          clearInterval(checkGoogleMaps);
        }
      }, 500);

      // Clear interval after 10 seconds to prevent infinite checking
      setTimeout(() => {
        if (!window.google?.maps) {
          clearInterval(checkGoogleMaps);
          setLoadError("Google Maps failed to load after 10 seconds");
        }
      }, 10000);

      return () => clearInterval(checkGoogleMaps);
    }
  }, []);

  // Get current location on component mount
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setCurrentLocation(location);
      } catch (error) {
        console.error("Error getting current location:", error);
      }
    };

    fetchCurrentLocation();

    // Set up periodic location updates
    const locationInterval = setInterval(fetchCurrentLocation, 10000); // Update every 10 seconds

    return () => clearInterval(locationInterval);
  }, []);

  // Calculate directions when pickup and destination are set
  useEffect(() => {
    if (!isLoaded || !map) {
      console.log("Map not ready yet:", {isLoaded, mapExists: !!map});
      return;
    }

    // Clear directions if showDirections is false or rideStatus is 'location' or 'idle'
    if (
      (!showDirections || rideStatus === "location" || rideStatus === "idle") &&
      directionsRendererRef.current
    ) {
      console.log(
        `Clearing directions because showDirections is ${showDirections} or rideStatus is '${rideStatus}'`
      );
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;

      // Also clear any stored directions response
      setDirections(null);

      // Clear any existing markers except the current location marker
      if (markersRef.current) {
        Object.values(markersRef.current).forEach((marker) => {
          if (marker && marker !== markersRef.current.currentLocation) {
            marker.setMap(null);
          }
        });
      }

      return;
    }

    try {
      // Initialize directions service if not already done
      if (!directionsServiceRef.current) {
        directionsServiceRef.current =
          new window.google.maps.DirectionsService();
      }

      // Clear previous directions
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }

      // Create new directions renderer
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer(
        {
          map,
          suppressMarkers: true, // We'll use our own markers
          preserveViewport: false,
          polylineOptions: {
            strokeColor: "#4285F4",
            strokeWeight: 5,
            strokeOpacity: 0.8,
          },
        }
      );

      // Determine which locations to use for directions based on ride status
      let origin, destination;

      if (
        rideStatus === "accepted" ||
        rideStatus === "finding" ||
        rideStatus === "confirmed"
      ) {
        // When ride is accepted but not started, show directions from rider to pickup
        if (riderLocation) {
          origin = riderLocation;
          destination = pickupLocation;
          console.log(
            "Showing directions from rider to pickup:",
            origin,
            destination
          );
        } else {
          origin = currentLocation;
          destination = pickupLocation;
          console.log(
            "Showing directions from current to pickup:",
            origin,
            destination
          );
        }
      } else if (rideStatus === "in-progress") {
        // When ride is in progress, show directions from current location to destination
        origin = riderLocation || currentLocation;
        destination = destinationLocation;
        console.log("Showing directions to destination:", {
          origin,
          destination,
          rideStatus,
          riderLocation,
          currentLocation,
        });

        // If we don't have a destination yet, use a fallback
        if (!destination && pickupLocation) {
          console.log(
            "No destination found, using pickup location as fallback"
          );
          destination = pickupLocation;
        }
      } else {
        // Default case - show directions between pickup and destination if available
        origin = pickupLocation;
        destination = destinationLocation;
        console.log("Showing default directions:", origin, destination);
      }

      // Calculate directions if we have both origin and destination
      if (origin && destination && showDirections && isLoaded) {
        // Format origin and destination to ensure they're in the correct format
        const formatLocation = (location) => {
          // If it's already a LatLng or LatLngLiteral, return it
          if (typeof location === "string") {
            return location;
          }

          // If it has lat and lng properties as numbers, return a proper LatLngLiteral
          if (
            location.lat !== undefined &&
            location.lng !== undefined &&
            typeof location.lat === "number" &&
            typeof location.lng === "number"
          ) {
            return {lat: location.lat, lng: location.lng};
          }

          // If it has coordinates array [lng, lat], convert to LatLngLiteral
          if (
            location.coordinates &&
            Array.isArray(location.coordinates) &&
            location.coordinates.length === 2
          ) {
            return {lat: location.coordinates[1], lng: location.coordinates[0]};
          }

          // If it has latitude and longitude properties, convert to LatLngLiteral
          if (
            location.latitude !== undefined &&
            location.longitude !== undefined
          ) {
            return {lat: location.latitude, lng: location.longitude};
          }

          // If it has location object with lat and lng, use that
          if (
            location.location &&
            location.location.lat !== undefined &&
            location.location.lng !== undefined
          ) {
            return {lat: location.location.lat, lng: location.location.lng};
          }

          // If it has address property but no coordinates, log warning and return null
          if (location.address && (!location.lat || !location.lng)) {
            console.warn(
              "Location has address but no valid coordinates:",
              location
            );
            return null;
          }

          console.error("Unable to format location:", location);
          return null;
        };

        const formattedOrigin = formatLocation(origin);
        const formattedDestination = formatLocation(destination);

        console.log("Calculating directions with formatted locations:", {
          originalOrigin: origin,
          originalDestination: destination,
          formattedOrigin,
          formattedDestination,
          rideStatus,
          showDirections,
        });

        if (!formattedOrigin || !formattedDestination) {
          console.error(
            "Cannot calculate directions: invalid origin or destination after formatting"
          );
          return;
        }

        try {
          directionsServiceRef.current.route(
            {
              origin: formattedOrigin,
              destination: formattedDestination,
              travelMode: window.google.maps.TravelMode.DRIVING,
              optimizeWaypoints: true,
              provideRouteAlternatives: false,
              avoidTolls: false,
              avoidHighways: false,
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                directionsRendererRef.current.setDirections(result);
                setDirections(result);

                // Fit the map to the directions
                const bounds = new window.google.maps.LatLngBounds();
                result.routes[0].legs.forEach((leg) => {
                  leg.steps.forEach((step) => {
                    step.path.forEach((point) => {
                      bounds.extend(point);
                    });
                  });
                });
                map.fitBounds(bounds);
              } else {
                console.error(`Directions request failed: ${status}`);
                // If directions fail, at least make sure both markers are visible
                if (map && origin && destination) {
                  try {
                    const bounds = new window.google.maps.LatLngBounds();
                    bounds.extend(origin);
                    bounds.extend(destination);
                    map.fitBounds(bounds);
                  } catch (e) {
                    console.error("Error fitting bounds:", e);
                  }
                }
              }
            }
          );
        } catch (error) {
          console.error("Error calculating directions:", error);
        }
      }
    } catch (error) {
      console.error("Error setting up directions renderer:", error);
    }
  }, [
    isLoaded,
    map,
    pickupLocation,
    destinationLocation,
    riderLocation,
    passengerLocation,
    showDirections,
    rideStatus,
  ]);

  const onLoad = useCallback(
    (map) => {
      mapRef.current = map;
      setMap(map);
      if (onMapLoad) {
        onMapLoad(map);
      }
    },
    [onMapLoad]
  );

  const onUnmount = useCallback(() => {
    // Clean up markers
    if (markersRef.current) {
      Object.values(markersRef.current).forEach((marker) => {
        if (marker) {
          marker.setMap(null);
        }
      });
      markersRef.current = {};
    }

    // Clean up directions renderer
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }

    // Clean up map references
    mapRef.current = null;
    setMap(null);
  }, []);

  // Handle marker click to show info window
  const handleMarkerClick = (markerType) => {
    setSelectedMarker(markerType);
  };

  if (loadError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Error loading Google Maps!</strong>
        <p className="block sm:inline">
          {" "}
          Please check your internet connection and try again.
        </p>
        <p className="text-sm mt-2">
          Technical details: {loadError.message || "Unknown error"}
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{height: "400px"}}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  // Determine the center of the map based on available locations
  let center;
  if (rideStatus === "location") {
    // When in location selection mode, center on current location
    center = currentLocation || {lat: 20.5937, lng: 78.9629}; // Default to center of India
    console.log(
      "Centering map on current location for location selection",
      center
    );
  } else if (rideStatus === "accepted" && riderLocation) {
    center = riderLocation;
  } else if (rideStatus === "in-progress") {
    // Center between current location and destination during ride
    if (destinationLocation) {
      center = destinationLocation;
      console.log(
        "Centering map on destination for in-progress ride",
        destinationLocation
      );
    } else if (currentLocation) {
      center = currentLocation;
      console.log(
        "Centering map on current location for in-progress ride",
        currentLocation
      );
    } else if (pickupLocation) {
      center = pickupLocation;
      console.log(
        "Centering map on pickup location for in-progress ride",
        pickupLocation
      );
    } else {
      center = {lat: 20.5937, lng: 78.9629}; // Default to center of India
      console.log("Using default center for in-progress ride");
    }
  } else {
    center = pickupLocation ||
      passengerLocation ||
      currentLocation || {lat: 20.5937, lng: 78.9629}; // Default to center of India
  }

  console.log("Final map center:", center, "Ride status:", rideStatus);

  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={14}
        options={options}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Current user location marker */}
        {currentLocation && !pickupLocation && (
          <Marker
            position={currentLocation}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
            onClick={() => handleMarkerClick("current")}
            onLoad={(marker) => {
              markersRef.current.currentLocation = marker;
            }}
          />
        )}

        {/* Pickup location marker */}
        {pickupLocation && (
          <Marker
            position={pickupLocation}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            }}
            onClick={() => handleMarkerClick("pickup")}
            onLoad={(marker) => {
              markersRef.current.pickup = marker;
            }}
          >
            {selectedMarker === "pickup" && (
              <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                <div>
                  <h3 className="font-bold">Pickup Location</h3>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Destination location marker */}
        {destinationLocation && (
          <Marker
            position={destinationLocation}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
            onClick={() => handleMarkerClick("destination")}
            onLoad={(marker) => {
              markersRef.current.destination = marker;
            }}
          >
            {selectedMarker === "destination" && (
              <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                <div>
                  <h3 className="font-bold">Destination</h3>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Rider location marker */}
        {riderLocation && (
          <Marker
            position={riderLocation}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
            }}
            onClick={() => handleMarkerClick("rider")}
            onLoad={(marker) => {
              markersRef.current.rider = marker;
            }}
          >
            {selectedMarker === "rider" && (
              <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                <div>
                  <h3 className="font-bold">Rider Location</h3>
                  <p>Your ride is on the way</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Passenger location marker */}
        {passengerLocation && (
          <Marker
            position={passengerLocation}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
            onClick={() => handleMarkerClick("passenger")}
            onLoad={(marker) => {
              markersRef.current.passenger = marker;
            }}
          >
            {selectedMarker === "passenger" && (
              <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                <div>
                  <h3 className="font-bold">Passenger Location</h3>
                  <p>Your passenger is waiting</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}
      </GoogleMap>
    </div>
  );
};

export default Map;

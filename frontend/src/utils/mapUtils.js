// Get current location using browser's geolocation API
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {enableHighAccuracy: true}
      );
    }
  });
};

// Calculate distance between two points using Google Maps Distance Matrix API
export const calculateDistance = async (origin, destination) => {
  try {
    if (!window.google || !window.google.maps) {
      throw new Error("Google Maps API not loaded");
    }

    return new Promise((resolve, reject) => {
      const service = new window.google.maps.DistanceMatrixService();

      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === "OK" && response.rows[0].elements[0].status === "OK") {
            resolve({
              distance: response.rows[0].elements[0].distance,
              duration: response.rows[0].elements[0].duration,
            });
          } else {
            reject(new Error("Failed to calculate distance"));
          }
        }
      );
    });
  } catch (error) {
    console.error("Error calculating distance:", error);
    throw error;
  }
};

// Calculate fare based on distance and vehicle type
export const calculateFare = (distanceInMeters, vehicleType) => {
  const distanceInKm = distanceInMeters / 1000;
  let baseFare = 0;
  let ratePerKm = 0;

  switch (vehicleType) {
    case "bike":
      baseFare = 20;
      ratePerKm = 8;
      break;
    case "auto":
      baseFare = 30;
      ratePerKm = 12;
      break;
    case "car":
      baseFare = 50;
      ratePerKm = 15;
      break;
    default:
      baseFare = 30;
      ratePerKm = 10;
  }

  return Math.round(baseFare + distanceInKm * ratePerKm);
};

// Format address from Google Maps place result
export const formatAddress = (place) => {
  if (!place) return "";

  return place.formatted_address || place.name || "";
};

// Convert address to coordinates using Google Maps Geocoding API
export const geocodeAddress = async (address) => {
  try {
    if (!window.google || !window.google.maps) {
      throw new Error("Google Maps API not loaded");
    }

    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({address}, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formattedAddress: results[0].formatted_address,
          });
        } else {
          reject(new Error("No results found or geocoding failed"));
        }
      });
    });
  } catch (error) {
    console.error("Error geocoding address:", error);
    throw error;
  }
};

// Convert coordinates to address using Google Maps Reverse Geocoding API
export const reverseGeocode = async (lat, lng) => {
  try {
    if (!window.google || !window.google.maps) {
      throw new Error("Google Maps API not loaded");
    }

    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({location: {lat, lng}}, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error("No results found or reverse geocoding failed"));
        }
      });
    });
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    throw error;
  }
};

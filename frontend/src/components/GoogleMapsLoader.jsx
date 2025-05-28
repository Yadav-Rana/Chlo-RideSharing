import {useEffect, useState} from "react";

// Google Maps API key
const API_KEY = "AIzaSyDDQNyvN8tT2JpnZNrbWIxIiEt6B43ZDaw";

// Define all libraries we need
// Note: 'directions' is not a separate library, it's part of the core API
const LIBRARIES = ["places"];

// Create a global variable to track if the script is already loaded
window.googleMapsLoaded = window.googleMapsLoaded || false;

const GoogleMapsLoader = ({children}) => {
  const [isLoaded, setIsLoaded] = useState(window.googleMapsLoaded);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If Google Maps is already loaded, don't load it again
    if (window.google && window.google.maps) {
      window.googleMapsLoaded = true;
      setIsLoaded(true);
      return;
    }

    // If we're already in the process of loading, don't start again
    if (
      document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')
    ) {
      console.log("Google Maps script is already being loaded");
      return;
    }

    const loadGoogleMapsScript = () => {
      console.log("Loading Google Maps script directly...");

      // Create the script element
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=${LIBRARIES.join(
        ","
      )}&v=weekly`;
      script.async = true;
      script.defer = true;

      // Set up event handlers
      script.onload = () => {
        console.log("Google Maps script loaded successfully");
        window.googleMapsLoaded = true;
        setIsLoaded(true);
      };

      script.onerror = (e) => {
        console.error("Error loading Google Maps script:", e);
        setError(
          "Failed to load Google Maps. Please check your internet connection and try again."
        );
      };

      // Add the script to the document
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();

    // Cleanup function
    return () => {
      // We don't remove the script on unmount because other components might need it
    };
  }, []);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Error loading Google Maps!</strong>
        <p className="block sm:inline"> {error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg p-4"
        style={{minHeight: "200px"}}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default GoogleMapsLoader;

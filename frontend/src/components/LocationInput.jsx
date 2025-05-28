import {useState, useEffect, useRef} from "react";
import {motion} from "framer-motion";

const LocationInput = ({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  className = "",
}) => {
  const [inputValue, setInputValue] = useState(value?.address || "");
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

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

  // Update input value when prop changes
  useEffect(() => {
    if (value?.address && value.address !== inputValue) {
      setInputValue(value.address);
    }
  }, [value, inputValue]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;
    if (autocompleteRef.current) return; // Already initialized

    try {
      console.log("Initializing Google Places Autocomplete");

      // Use the traditional Autocomplete which is more reliable
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          componentRestrictions: {country: "in"}, // Restrict to India
          fields: [
            "address_components",
            "geometry",
            "name",
            "formatted_address",
          ],
        }
      );

      autocompleteRef.current = autocomplete;

      // Add listener for place selection
      const listener = autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        console.log("Selected place:", place);

        if (!place.geometry) {
          console.error("No geometry found for this place");
          return;
        }

        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        const address = place.formatted_address || place.name;
        setInputValue(address);

        if (onChange) {
          onChange({
            address,
            location,
          });
        }
      });

      // Return cleanup function
      return () => {
        if (autocompleteRef.current) {
          window.google.maps.event.clearInstanceListeners(
            autocompleteRef.current
          );
          autocompleteRef.current = null;
        }
      };
    } catch (error) {
      console.error("Error initializing Google Places Autocomplete:", error);
    }
  }, [isLoaded, onChange]);

  // Handle input changes
  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    // If the input is cleared, call onChange with null
    if (e.target.value === "" && onChange) {
      onChange(null);
    }
  };

  // Handle loading errors
  if (loadError) {
    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm">
          Could not load location search. Please try again later.
        </div>
      </div>
    );
  }

  // Handle loading state
  if (!isLoaded) {
    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="border border-gray-300 rounded w-full py-2 px-3 bg-gray-50 flex items-center justify-center">
          <div className="animate-pulse flex space-x-2 items-center">
            <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
            <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
            <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
            <span className="text-sm text-gray-500 ml-2">
              Loading location search...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-white text-sm font-bold mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <motion.div
        whileFocus={{scale: 1.01}}
        transition={{type: "spring", stiffness: 300}}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-[#2A2F45] leading-tight focus:outline-none focus:shadow-outline focus:border-orange-500 transition-all"
          required={required}
          autoComplete="off"
        />
      </motion.div>
    </div>
  );
};

export default LocationInput;

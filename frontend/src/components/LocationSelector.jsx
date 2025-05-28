import {useState, useEffect} from "react";
import {motion} from "framer-motion";
import {getCurrentLocation} from "../utils/mapUtils";
import Button from "./Button";
import LocationInput from "./LocationInput";

const LocationSelector = ({onLocationChange}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Try to get live location when component mounts
  useEffect(() => {
    handleGetLiveLocation();
  }, []);

  const handlePlaceSelected = (place) => {
    console.log("Selected place:", place);
    setSelectedPlace(place);

    if (place && place.location) {
      if (onLocationChange) {
        onLocationChange(place.location);
      }
    }
  };

  const handleGetLiveLocation = async () => {
    setIsGettingLocation(true);
    setLocationError("");

    try {
      // Force high accuracy and don't use cached location
      const location = await getCurrentLocation();
      console.log("Got live location:", location);

      if (onLocationChange) {
        onLocationChange(location);
      }
    } catch (error) {
      console.error("Error getting live location:", error);
      setLocationError(
        "Could not get your current location. Please check your location permissions."
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <motion.div
      className="bg-white p-3 sm:p-4 rounded-lg shadow-md mb-3 sm:mb-4 max-w-full overflow-hidden"
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.3}}
    >
      <h3 className="text-base sm:text-lg font-semibold mb-2">Your Location</h3>

      <div className="flex flex-col gap-2 sm:gap-3">
        <Button
          onClick={handleGetLiveLocation}
          variant="primary"
          disabled={isGettingLocation}
          className="w-full text-sm sm:text-base py-2"
        >
          {isGettingLocation
            ? "Getting Location..."
            : "📍 Use My Current Location"}
        </Button>

        {locationError && (
          <div className="text-xs sm:text-sm text-red-600 mt-1 break-words">
            {locationError}
          </div>
        )}

        <div className="flex items-center my-2">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-xs sm:text-sm text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm text-gray-600">
            Search for a specific location:
          </label>
          <LocationInput
            placeholder="Enter an address or location"
            onChange={handlePlaceSelected}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LocationSelector;

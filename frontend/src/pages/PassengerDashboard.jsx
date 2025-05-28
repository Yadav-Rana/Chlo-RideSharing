import {useState, useEffect, useContext} from "react";
import {motion} from "framer-motion";
import AuthContext from "../context/AuthContext";
import SocketContext from "../context/SocketContext";
import Map from "../components/Map";
import LocationInput from "../components/LocationInput";
import LocationSelector from "../components/LocationSelector";
import UserRideHistory from "../components/UserRideHistory";
import Button from "../components/Button";
import Loader from "../components/Loader";
import {
  calculateDistance,
  calculateFare,
  getCurrentLocation,
} from "../utils/mapUtils";
import {createRide, getRideById, completeRide, cancelRide} from "../utils/api";

const PassengerDashboard = () => {
  const {user} = useContext(AuthContext);
  const {
    socket,
    connected,
    sendRideRequest,
    updateLocation,
    respondToOTPValidation,
  } = useContext(SocketContext);

  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [rideOptions, setRideOptions] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState("location"); // location, options, finding, confirmed, in-progress
  const [currentRide, setCurrentRide] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapUpdateTimestamp, setMapUpdateTimestamp] = useState(Date.now()); // Used to force map updates
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0); // Used to trigger ride history refresh

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
  }, []);

  // Listen for socket events
  useEffect(() => {
    if (socket) {
      // Listen for ride acceptance
      socket.on("rideAccepted", (data) => {
        console.log("Ride accepted data:", data); // Debug log
        // Make sure we have the OTP in the ride data
        if (data.ride && data.ride.otp) {
          setCurrentRide(data.ride);
          setRiderLocation(data.riderLocation);
          setCurrentStep("confirmed");

          // Start sending location updates to the rider
          if (data.riderId) {
            // Set up interval to send location updates
            const locationInterval = setInterval(async () => {
              try {
                const location = await getCurrentLocation();
                updateLocation({
                  location,
                  userId: user._id,
                  recipientId: data.riderId,
                  rideId: data.ride._id,
                  userType: "passenger",
                });
              } catch (error) {
                console.error("Error updating location:", error);
              }
            }, 10000); // Update every 10 seconds

            // Store the interval ID to clear it later
            window.locationUpdateInterval = locationInterval;
          }
        } else {
          console.error("Ride accepted but OTP is missing:", data);
          // If OTP is missing, try to fetch the ride details from the API
          if (data.ride && data.ride._id) {
            getRideById(data.ride._id)
              .then((rideData) => {
                setCurrentRide(rideData);
                setRiderLocation(data.riderLocation);
                setCurrentStep("confirmed");

                // Start sending location updates to the rider
                if (data.riderId) {
                  // Set up interval to send location updates
                  const locationInterval = setInterval(async () => {
                    try {
                      const location = await getCurrentLocation();
                      updateLocation({
                        location,
                        userId: user._id,
                        recipientId: data.riderId,
                        rideId: rideData._id,
                        userType: "passenger",
                      });
                    } catch (error) {
                      console.error("Error updating location:", error);
                    }
                  }, 10000); // Update every 10 seconds

                  // Store the interval ID to clear it later
                  window.locationUpdateInterval = locationInterval;
                }
              })
              .catch((error) => {
                console.error("Error fetching ride details:", error);
                setError("Failed to get ride details. Please try again.");
              });
          }
        }
      });

      // Listen for location updates
      socket.on("locationUpdated", (data) => {
        console.log("Received location update:", data);
        if (data.location && data.userType === "rider") {
          console.log("Updating rider location to:", data.location);
          setRiderLocation(data.location);

          // If we're in the confirmed or in-progress state, make sure the map is updated
          if (currentStep === "confirmed" || currentStep === "in-progress") {
            // Force a re-render of the map by updating a timestamp
            setMapUpdateTimestamp(Date.now());
          }
        }
      });

      // Listen for OTP validation requests
      socket.on("otpValidationRequest", (data) => {
        console.log("Received OTP validation request:", data);
        if (currentRide && currentRide.otp) {
          // Automatically validate the OTP
          const isValid = data.enteredOTP === currentRide.otp;
          respondToOTPValidation(data.rideId, data.riderId, isValid);

          if (isValid) {
            // If OTP is valid, update the ride status to in-progress
            setCurrentStep("in-progress");
          }
        }
      });

      return () => {
        socket.off("rideAccepted");
        socket.off("locationUpdated");
        socket.off("otpValidationRequest");

        // Clear location update interval if it exists
        if (window.locationUpdateInterval) {
          clearInterval(window.locationUpdateInterval);
          window.locationUpdateInterval = null;
        }
      };
    }
  }, [socket, currentRide, user, updateLocation, respondToOTPValidation]);

  // Calculate ride options when pickup and destination are set
  const handleFindRides = async () => {
    if (!pickupLocation || !destinationLocation) {
      setError("Please enter pickup and destination locations");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Calculate distance and duration using Google Maps API
      const result = await calculateDistance(
        pickupLocation.location,
        destinationLocation.location,
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      );

      const distanceInMeters = result.distance.value;
      const durationInSeconds = result.duration.value;

      // Calculate fares for different vehicle types
      const options = [
        {
          type: "bike",
          name: "Bike",
          fare: calculateFare(distanceInMeters, "bike"),
          distance: result.distance.text,
          duration: result.duration.text,
          icon: "🏍️",
        },
        {
          type: "auto",
          name: "Auto",
          fare: calculateFare(distanceInMeters, "auto"),
          distance: result.distance.text,
          duration: result.duration.text,
          icon: "🛺",
        },
        {
          type: "car",
          name: "Car",
          fare: calculateFare(distanceInMeters, "car"),
          distance: result.distance.text,
          duration: result.duration.text,
          icon: "🚗",
        },
      ];

      setRideOptions(options);
      setCurrentStep("options");
    } catch (error) {
      console.error("Error calculating ride options:", error);
      setError("Failed to calculate ride options. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Book a ride
  const handleBookRide = async () => {
    if (!selectedVehicleType) {
      setError("Please select a vehicle type");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const selectedOption = rideOptions.find(
        (option) => option.type === selectedVehicleType
      );

      // Create ride in the database
      const rideData = {
        pickupLocation: {
          address: pickupLocation.address,
          coordinates: pickupLocation.coordinates,
        },
        destinationLocation: {
          address: destinationLocation.address,
          coordinates: destinationLocation.coordinates,
        },
        distance: parseFloat(selectedOption.distance.replace(" km", "")),
        duration: parseInt(selectedOption.duration.replace(" mins", "")),
        fare: selectedOption.fare,
        vehicleType: selectedVehicleType,
      };

      const ride = await createRide(rideData);
      setCurrentRide(ride);

      // Send ride request via socket with enhanced data
      console.log("Sending ride request with data:", ride);

      // Create a simplified ride request object
      const rideRequest = {
        ride: {
          _id: ride._id,
          pickupLocation: ride.pickupLocation,
          destinationLocation: ride.destinationLocation,
          fare: ride.fare,
          distance: ride.distance,
          vehicleType: ride.vehicleType,
          passenger: {
            _id: user._id,
            name: user.name,
          },
        },
        passengerId: user._id,
        passengerName: user.name,
        timestamp: Date.now(),
      };

      // Send the ride request
      sendRideRequest(rideRequest);

      // Also try a direct socket emit for testing
      if (socket && connected) {
        console.log("Also trying direct socket emit");
        socket.emit("directRideRequest", rideRequest);
      }

      setCurrentStep("finding");
    } catch (error) {
      console.error("Error booking ride:", error);
      setError("Failed to book ride. Please try again.");
      setLoading(false);
    }
  };

  // Cancel or complete ride
  const handleCancelRide = async () => {
    // Clear location update interval if it exists
    if (window.locationUpdateInterval) {
      clearInterval(window.locationUpdateInterval);
      window.locationUpdateInterval = null;
      console.log("Cleared passenger location update interval");
    }

    // Log the current state before resetting
    console.log("Cancelling/ending ride, current state:", {
      currentStep,
      hasPickupLocation: !!pickupLocation,
      hasDestinationLocation: !!destinationLocation,
      hasCurrentRide: !!currentRide,
    });

    try {
      // If the ride is in progress, complete it instead of cancelling
      if (currentRide && currentStep === "in-progress") {
        console.log("Completing ride with ID:", currentRide._id);
        await completeRide(currentRide._id);
        console.log("Ride completed successfully");

        // Show a success message
        alert("Ride completed successfully! Thank you for using Chlo.");
      } else if (currentRide && currentStep === "confirmed") {
        // If the ride is confirmed but not started, cancel it
        console.log("Cancelling ride with ID:", currentRide._id);
        await cancelRide(currentRide._id);
        console.log("Ride cancelled successfully");
      }
    } catch (error) {
      console.error("Error completing/cancelling ride:", error);
      // Continue with state reset even if API call fails
    }

    // Reset all ride-related state
    setCurrentStep("location");
    setPickupLocation(null);
    setDestinationLocation(null);
    setRideOptions(null);
    setSelectedVehicleType("");
    setCurrentRide(null);
    setRiderLocation(null);

    // Force a re-render of the map component
    setMapUpdateTimestamp(Date.now());

    // Trigger a refresh of the ride history
    setHistoryRefreshTrigger((prev) => prev + 1);

    console.log("Ride cancelled/ended, state reset complete");
  };

  return (
    <div
      className="page-container bg-app text-white"
      style={{paddingTop: "9rem"}}
    >
      <div className="container mx-auto px-4">
        <motion.h1
          className="text-3xl font-bold mb-6 text-orange-500"
          initial={{opacity: 0, y: -20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5}}
        >
          Passenger Dashboard
        </motion.h1>

        {error && (
          <motion.div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Map
              key={`map-${mapUpdateTimestamp}`} // Force re-render when rider location updates
              pickupLocation={pickupLocation?.location}
              destinationLocation={destinationLocation?.location}
              riderLocation={riderLocation}
              passengerLocation={currentLocation}
              showDirections={
                currentStep === "options" ||
                currentStep === "confirmed" ||
                currentStep === "in-progress"
              }
              rideStatus={currentStep}
              className="mb-6"
              onMapLoad={(map) => {
                console.log(
                  "Map loaded in PassengerDashboard, current step:",
                  currentStep
                );
              }}
            />

            {currentStep === "location" && (
              <motion.div
                className="bg-[#1E2235] p-6 rounded-lg shadow-md text-white"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.2}}
              >
                <h2 className="text-xl font-semibold mb-4 text-orange-500">
                  Book a Ride
                </h2>

                <LocationInput
                  label="Pickup Location"
                  placeholder="Enter pickup location"
                  value={pickupLocation?.address || ""}
                  onChange={setPickupLocation}
                  required
                />

                <LocationInput
                  label="Destination"
                  placeholder="Enter destination"
                  value={destinationLocation?.address || ""}
                  onChange={setDestinationLocation}
                  required
                />

                <Button
                  onClick={handleFindRides}
                  disabled={loading || !pickupLocation || !destinationLocation}
                  fullWidth
                >
                  {loading ? "Calculating..." : "Find Rides"}
                </Button>
              </motion.div>
            )}

            {currentStep === "options" && (
              <motion.div
                className="bg-[#1E2235] p-6 rounded-lg shadow-md text-white"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.2}}
              >
                <h2 className="text-xl font-semibold mb-4 text-orange-500">
                  Available Rides
                </h2>

                <div className="space-y-4 mb-6">
                  {rideOptions.map((option) => (
                    <div
                      key={option.type}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedVehicleType === option.type
                          ? "border-orange-500 bg-orange-900/20"
                          : "border-gray-600 hover:border-orange-300"
                      }`}
                      onClick={() => setSelectedVehicleType(option.type)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3 text-orange-400">
                            {option.icon}
                          </span>
                          <div>
                            <h3 className="font-medium text-orange-400">
                              {option.name}
                            </h3>
                            <p className="text-sm text-gray-300">
                              {option.distance} • {option.duration}
                            </p>
                          </div>
                        </div>
                        <div className="text-xl font-semibold text-orange-500">
                          ₹{option.fare}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={() => setCurrentStep("location")}
                    variant="outline"
                    fullWidth
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleBookRide}
                    disabled={loading || !selectedVehicleType}
                    fullWidth
                  >
                    {loading ? "Booking..." : "Book Now"}
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === "finding" && (
              <motion.div
                className="bg-[#1E2235] p-6 rounded-lg shadow-md text-center text-white"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.2}}
              >
                <Loader text="Finding a rider near you..." />
                <p className="mt-4 text-gray-300">
                  This may take a few moments. Please wait...
                </p>
                <Button
                  onClick={handleCancelRide}
                  variant="outline"
                  className="mt-6"
                >
                  Cancel
                </Button>
              </motion.div>
            )}

            {(currentStep === "confirmed" || currentStep === "in-progress") &&
              currentRide && (
                <motion.div
                  className="bg-[#1E2235] p-6 rounded-lg shadow-md text-white"
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  transition={{delay: 0.2}}
                >
                  <h2 className="text-xl font-semibold mb-4 text-orange-500">
                    {currentStep === "in-progress"
                      ? "Ride in Progress"
                      : "Ride Confirmed!"}
                  </h2>

                  <div
                    className={`${
                      currentStep === "in-progress"
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-green-50 border border-green-200"
                    } rounded-lg p-4 mb-4`}
                  >
                    <div className="flex items-center mb-2">
                      <span
                        className={`${
                          currentStep === "in-progress"
                            ? "text-blue-500"
                            : "text-green-500"
                        } text-xl mr-2`}
                      >
                        {currentStep === "in-progress" ? "🚗" : "✓"}
                      </span>
                      <span className="font-medium">
                        {currentStep === "in-progress"
                          ? "Your ride is in progress"
                          : "Your ride has been confirmed"}
                      </span>
                    </div>
                    {currentStep === "confirmed" &&
                      (currentRide.otp ? (
                        <div className="mt-2 p-3 bg-[#2A2F45] rounded border-2 border-green-500">
                          <p className="text-sm text-gray-300 mb-1">
                            Your OTP:
                          </p>
                          <p className="text-2xl font-bold text-green-500">
                            {currentRide.otp}
                          </p>
                          <p className="text-sm text-gray-300 mt-1">
                            Share this code with your rider to start the trip
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 p-3 bg-[#2A2F45] rounded border border-yellow-500">
                          <p className="text-sm text-yellow-500">
                            OTP not available. Please contact support if the
                            rider asks for an OTP.
                          </p>
                        </div>
                      ))}

                    {currentStep === "in-progress" && (
                      <div className="mt-2 p-3 bg-[#2A2F45] rounded border-2 border-blue-500">
                        <p className="text-sm text-gray-300 mb-1">
                          Ride Status:
                        </p>
                        <p className="text-lg font-bold text-blue-500">
                          On the way to destination
                        </p>
                        <p className="text-sm text-gray-300 mt-1">
                          You can track your ride on the map
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-b border-gray-700 pb-4 mb-4">
                    <h3 className="font-medium mb-2 text-orange-400">
                      Ride Details
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-400">Pickup:</div>
                      <div className="text-white">
                        {currentRide.pickupLocation.address}
                      </div>
                      <div className="text-gray-400">Destination:</div>
                      <div className="text-white">
                        {currentRide.destinationLocation.address}
                      </div>
                      <div className="text-gray-400">Distance:</div>
                      <div className="text-white">
                        {currentRide.distance} km
                      </div>
                      <div className="text-gray-400">Fare:</div>
                      <div className="text-orange-500 font-semibold">
                        ₹{currentRide.fare}
                      </div>
                    </div>
                  </div>

                  {currentRide.rider && (
                    <div>
                      <h3 className="font-medium mb-2 text-orange-400">
                        Rider Information
                      </h3>
                      <div className="flex items-center">
                        <div className="bg-orange-900/30 rounded-full w-12 h-12 flex items-center justify-center text-orange-500 font-bold mr-3 border border-orange-500/50">
                          {currentRide.rider.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {currentRide.rider.name}
                          </p>
                          <p className="text-sm text-gray-300">
                            {currentRide.rider.vehicle.model} •{" "}
                            {currentRide.rider.vehicle.registrationNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleCancelRide}
                    variant="outline"
                    className="mt-6"
                    fullWidth
                  >
                    {currentStep === "in-progress" ? "End Ride" : "Cancel Ride"}
                  </Button>
                </motion.div>
              )}
          </div>

          <div>
            {/* User Ride History Component */}
            {user && (
              <UserRideHistory
                userId={user._id}
                refreshTrigger={historyRefreshTrigger}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDashboard;

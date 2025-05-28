import {useState, useEffect, useContext, useCallback} from "react";
import {motion} from "framer-motion";
import AuthContext from "../context/AuthContext";
import SocketContext from "../context/SocketContext";
import Map from "../components/Map";
import LocationSelector from "../components/LocationSelector";
import RiderEarnings from "../components/RiderEarnings";
import Button from "../components/Button";
import Loader from "../components/Loader";
import {getCurrentLocation} from "../utils/mapUtils";
import {
  updateUserLocation,
  updateRiderAvailability,
  acceptRide,
  startRide,
  completeRide,
} from "../utils/api";

const RiderDashboard = () => {
  const {user} = useContext(AuthContext);
  const {
    socket,
    connected,
    acceptRide: socketAcceptRide,
    updateLocation,
    validateOTP,
    isWithinRadius,
  } = useContext(SocketContext);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rideRequests, setRideRequests] = useState([]);
  const [currentRide, setCurrentRide] = useState(null);
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [rideStatus, setRideStatus] = useState("idle"); // idle, accepted, in-progress, completed

  // Log when ride status changes
  useEffect(() => {
    console.log(`Ride status changed to: ${rideStatus}`, {
      currentRide: currentRide?._id,
      hasDestination: !!currentRide?.destinationLocation,
      hasPassengerLocation: !!passengerLocation,
      hasCurrentLocation: !!currentLocation,
    });
  }, [rideStatus, currentRide, passengerLocation, currentLocation]);
  const [mapUpdateTimestamp, setMapUpdateTimestamp] = useState(Date.now()); // Used to force map updates
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0); // Used to trigger ride history refresh

  // Get current location and update periodically
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setCurrentLocation(location);

        // Update location in database and via socket
        if (user && location) {
          const locationData = {
            type: "Point",
            coordinates: [location.lng, location.lat],
          };

          await updateUserLocation(locationData);

          if (currentRide && rideStatus !== "idle") {
            updateLocation({
              location,
              riderId: user._id,
              recipientId: currentRide.passenger._id,
            });
          }
        }
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    fetchLocation();

    // Update location every 10 seconds
    const intervalId = setInterval(fetchLocation, 10000);

    return () => clearInterval(intervalId);
  }, [user, currentRide, rideStatus]);

  // Update map when locations or ride status changes
  useEffect(() => {
    console.log("Updating map due to location or status change:", {
      rideStatus,
      currentLocationExists: !!currentLocation,
      passengerLocationExists: !!passengerLocation,
      destinationExists: !!currentRide?.destinationLocation,
    });

    // Force map to update
    setMapUpdateTimestamp(Date.now());
  }, [currentLocation, passengerLocation, rideStatus, currentRide]);

  // We'll use a simpler approach for handling ride requests
  const handleRideRequests = () => {
    // This is just a placeholder function to show we're ready to receive ride requests
    console.log("Rider is available and ready to receive ride requests");
  };

  const handleLocationUpdate = useCallback(
    (data) => {
      if (data.location && data.userType === "passenger" && currentRide) {
        // Update passenger location if this is for the current ride
        if (data.rideId === currentRide._id) {
          setPassengerLocation(data.location);
        }
      }
    },
    [currentRide]
  );

  // Request notification permissions
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);

  // Listen for socket events - simplified version
  useEffect(() => {
    console.log("Rider Dashboard - Socket connection status:", {
      socketExists: !!socket,
      socketId: socket?.id,
      isConnected: socket?.connected,
      isAvailable,
      userId: user?._id,
      userType: user?.userType,
    });

    if (socket && isAvailable) {
      console.log("Setting up ride request listener for rider");

      // Super simple handler that always adds the ride request to the list
      const simpleRideRequestHandler = (data) => {
        console.log("SIMPLE HANDLER: New ride request received:", data);

        // Always add to the list without any filtering
        setRideRequests((prev) => {
          // Only check for duplicates by ID
          if (
            data.ride &&
            prev.some((req) => req.ride?._id === data.ride._id)
          ) {
            console.log("Duplicate ride request, not adding");
            return prev;
          }

          // Show notification
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("New Ride Request", {
              body: `New ride request received!`,
            });
          }

          console.log("Adding ride request to list");
          return [data, ...prev];
        });
      };

      // Remove any existing listeners
      socket.off("newRideRequest");

      // Add our simple handler
      socket.on("newRideRequest", simpleRideRequestHandler);

      // Log that we're ready
      console.log("Ride request listener set up successfully");

      // Also listen for test broadcasts
      socket.on("testBroadcast", (data) => {
        console.log("Test broadcast received:", data);
        // Show notification for test broadcasts too
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Test Broadcast", {
            body: data.message || "Test message",
          });
        }
      });

      return () => {
        console.log("Cleaning up ride request listeners");
        socket.off("newRideRequest");
        socket.off("testBroadcast");
      };
    }
  }, [socket, isAvailable, user]);

  // Toggle availability
  const toggleAvailability = async () => {
    try {
      setLoading(true);
      setError("");

      const newAvailability = !isAvailable;
      await updateRiderAvailability(newAvailability);
      setIsAvailable(newAvailability);

      // Clear ride requests when going offline
      if (!newAvailability) {
        setRideRequests([]);
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      setError("Failed to update availability. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Accept a ride request
  const handleAcceptRide = async (request) => {
    try {
      setLoading(true);
      setError("");

      // Accept ride in the database
      const ride = await acceptRide(request.ride._id);
      setCurrentRide(ride);
      setPassengerLocation({
        lat: request.ride.pickupLocation.coordinates[1],
        lng: request.ride.pickupLocation.coordinates[0],
      });

      // Notify passenger via socket
      socketAcceptRide({
        ride: {
          ...ride,
          otp: ride.otp, // Ensure OTP is included
        },
        riderId: user._id,
        riderName: user.name,
        riderLocation: currentLocation,
        passengerId: request.passengerId,
      });

      // Start sending location updates to the passenger
      if (request.passengerId) {
        // Send initial location update immediately
        (async () => {
          try {
            const location = await getCurrentLocation();
            setCurrentLocation(location);
            // Force map to update with new location
            setMapUpdateTimestamp(Date.now());
            updateLocation({
              location,
              userId: user._id,
              recipientId: request.passengerId,
              rideId: ride._id,
              userType: "rider",
            });
            console.log("Sent initial rider location update:", location);
          } catch (error) {
            console.error("Error sending initial location update:", error);
          }
        })();
        // Set up interval to send location updates
        const locationInterval = setInterval(async () => {
          try {
            const location = await getCurrentLocation();
            // Update local state with current location
            setCurrentLocation(location);
            // Force map to update with new location
            setMapUpdateTimestamp(Date.now());
            // Send location to passenger
            updateLocation({
              location,
              userId: user._id,
              recipientId: request.passengerId,
              rideId: ride._id,
              userType: "rider",
            });
            console.log("Sent rider location update:", location);
          } catch (error) {
            console.error("Error updating location:", error);
          }
        }, 5000); // Update every 5 seconds for more responsive tracking

        // Store the interval ID to clear it later
        window.riderLocationInterval = locationInterval;
      }

      setRideStatus("accepted");
      setRideRequests([]);
      setIsAvailable(false);
    } catch (error) {
      console.error("Error accepting ride:", error);
      setError("Failed to accept ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Start ride with OTP
  const handleStartRide = async () => {
    // If we have the OTP, show it in the prompt message
    const promptMessage =
      currentRide && currentRide.otp
        ? `Enter the OTP provided by the passenger (expected: ${currentRide.otp}):`
        : "Enter the OTP provided by the passenger:";

    const otp = prompt(promptMessage);

    if (!otp) return;

    try {
      setLoading(true);
      setError("");

      // First, validate the OTP through socket
      if (socket && connected && currentRide.passenger) {
        // Send OTP validation request to passenger
        validateOTP(
          currentRide._id,
          otp,
          currentRide.passenger._id || currentRide.passenger,
          user._id
        );

        // Listen for OTP validation result
        socket.once("otpValidationResult", async (data) => {
          if (data.isValid) {
            try {
              // If OTP is valid, start the ride
              const updatedRide = await startRide(currentRide._id, otp);

              // Ensure the destination location is properly formatted
              let formattedDestination = updatedRide.destinationLocation;

              // Log the destination location for debugging
              console.log(
                "Original destination location:",
                updatedRide.destinationLocation
              );

              // Format the destination location if needed
              if (
                updatedRide.destinationLocation &&
                updatedRide.destinationLocation.coordinates
              ) {
                formattedDestination = {
                  ...updatedRide.destinationLocation,
                  lat: updatedRide.destinationLocation.coordinates[1],
                  lng: updatedRide.destinationLocation.coordinates[0],
                };
                console.log(
                  "Formatted destination location:",
                  formattedDestination
                );
              }

              // Update the ride with the formatted destination
              const rideWithFormattedDestination = {
                ...updatedRide,
                destinationLocation: formattedDestination,
              };

              setCurrentRide(rideWithFormattedDestination);
              setRideStatus("in-progress");

              // Force map to update by updating the timestamp
              setMapUpdateTimestamp(Date.now());

              console.log(
                "Ride started, updating map with new status and locations:",
                {
                  rideStatus: "in-progress",
                  currentLocation,
                  destinationLocation: formattedDestination,
                  passengerLocation,
                }
              );
            } catch (error) {
              console.error("Error starting ride:", error);
              setError("Failed to start ride. Please try again.");
            } finally {
              setLoading(false);
            }
          } else {
            setError("Invalid OTP. Please try again.");
            setLoading(false);
          }
        });
      } else {
        // Fallback to direct API call if socket is not available
        const updatedRide = await startRide(currentRide._id, otp);

        // Ensure the destination location is properly formatted
        let formattedDestination = updatedRide.destinationLocation;

        // Log the destination location for debugging
        console.log(
          "Original destination location (fallback):",
          updatedRide.destinationLocation
        );

        // Format the destination location if needed
        if (
          updatedRide.destinationLocation &&
          updatedRide.destinationLocation.coordinates
        ) {
          formattedDestination = {
            ...updatedRide.destinationLocation,
            lat: updatedRide.destinationLocation.coordinates[1],
            lng: updatedRide.destinationLocation.coordinates[0],
          };
          console.log(
            "Formatted destination location (fallback):",
            formattedDestination
          );
        }

        // Update the ride with the formatted destination
        const rideWithFormattedDestination = {
          ...updatedRide,
          destinationLocation: formattedDestination,
        };

        setCurrentRide(rideWithFormattedDestination);
        setRideStatus("in-progress");

        // Force map to update by updating the timestamp
        setMapUpdateTimestamp(Date.now());

        console.log(
          "Ride started (fallback), updating map with new status and locations:",
          {
            rideStatus: "in-progress",
            currentLocation,
            destinationLocation: formattedDestination,
            passengerLocation,
          }
        );

        setLoading(false);
      }
    } catch (error) {
      console.error("Error starting ride:", error);
      setError("Invalid OTP or failed to start ride. Please try again.");
      setLoading(false);
    }
  };

  // Complete ride
  const handleCompleteRide = async () => {
    try {
      setLoading(true);
      setError("");

      const updatedRide = await completeRide(currentRide._id);
      setCurrentRide(updatedRide);
      setRideStatus("completed");

      // Clear location update interval if it exists
      if (window.riderLocationInterval) {
        clearInterval(window.riderLocationInterval);
        window.riderLocationInterval = null;
        console.log(
          "Cleared rider location update interval on ride completion"
        );
      }

      // Trigger a refresh of the ride history
      setHistoryRefreshTrigger((prev) => prev + 1);

      // Show a success message
      alert(
        "Ride completed successfully! Earnings have been added to your account."
      );
    } catch (error) {
      console.error("Error completing ride:", error);
      setError("Failed to complete ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset ride state
  const handleResetRide = () => {
    // Clear location update interval if it exists
    if (window.riderLocationInterval) {
      clearInterval(window.riderLocationInterval);
      window.riderLocationInterval = null;
      console.log("Cleared rider location update interval");
    }

    setCurrentRide(null);
    setPassengerLocation(null);
    setRideStatus("idle");
    setIsAvailable(true);
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
          Rider Dashboard
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
              key={`map-${mapUpdateTimestamp}`} // Force re-render when location updates
              pickupLocation={passengerLocation}
              destinationLocation={
                // Ensure we're passing a properly formatted location object
                currentRide?.destinationLocation?.location ||
                currentRide?.destinationLocation ||
                (currentRide?.destinationLocation?.coordinates
                  ? {
                      lat: currentRide.destinationLocation.coordinates[1],
                      lng: currentRide.destinationLocation.coordinates[0],
                    }
                  : null)
              }
              riderLocation={currentLocation}
              passengerLocation={passengerLocation}
              showDirections={rideStatus !== "idle"}
              rideStatus={rideStatus}
              className="mb-6"
              onMapLoad={(map) => {
                console.log("Map loaded in RiderDashboard");
                // Log the destination location for debugging
                console.log(
                  "Destination location passed to Map:",
                  currentRide?.destinationLocation?.location ||
                    currentRide?.destinationLocation ||
                    (currentRide?.destinationLocation?.coordinates
                      ? {
                          lat: currentRide.destinationLocation.coordinates[1],
                          lng: currentRide.destinationLocation.coordinates[0],
                        }
                      : null)
                );
              }}
            />

            <motion.div
              className="bg-[#1E2235] p-6 rounded-lg shadow-md text-white"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{delay: 0.2}}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-orange-500">
                  Your Status
                </h2>
                <div className="flex items-center">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      isAvailable ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></span>
                  <span className="text-white">
                    {isAvailable ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              {rideStatus === "idle" && (
                <Button
                  onClick={toggleAvailability}
                  variant={isAvailable ? "outline" : "primary"}
                  disabled={loading}
                  fullWidth
                >
                  {loading
                    ? "Updating..."
                    : isAvailable
                    ? "Go Offline"
                    : "Go Online"}
                </Button>
              )}

              {rideStatus === "accepted" && currentRide && (
                <div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <span className="text-blue-500 text-xl mr-2">🚗</span>
                      <span className="font-medium">Ride Accepted</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Head to the pickup location to meet your passenger.
                    </p>
                    {currentRide && currentRide.otp && (
                      <div className="mt-2 p-2 bg-white rounded border border-blue-300">
                        <p className="text-xs text-gray-500">
                          Passenger will provide this OTP:
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          {currentRide.otp}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-b pb-4 mb-4">
                    <h3 className="font-medium mb-2">Ride Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600">Pickup:</div>
                      <div>{currentRide.pickupLocation.address}</div>
                      <div className="text-gray-600">Destination:</div>
                      <div>{currentRide.destinationLocation.address}</div>
                      <div className="text-gray-600">Distance:</div>
                      <div>{currentRide.distance} km</div>
                      <div className="text-gray-600">Fare:</div>
                      <div>₹{currentRide.fare}</div>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartRide}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? "Processing..." : "Start Ride (Enter OTP)"}
                  </Button>
                </div>
              )}

              {rideStatus === "in-progress" && currentRide && (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <span className="text-green-500 text-xl mr-2">🚀</span>
                      <span className="font-medium">Ride In Progress</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      You are on your way to the destination.
                    </p>
                  </div>

                  <div className="border-b pb-4 mb-4">
                    <h3 className="font-medium mb-2">Destination</h3>
                    <p>{currentRide.destinationLocation.address}</p>
                  </div>

                  <Button
                    onClick={handleCompleteRide}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? "Processing..." : "Complete Ride"}
                  </Button>
                </div>
              )}

              {rideStatus === "completed" && currentRide && (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <span className="text-green-500 text-xl mr-2">✓</span>
                      <span className="font-medium">Ride Completed</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      You have successfully completed the ride.
                    </p>
                  </div>

                  <div className="border-b pb-4 mb-4">
                    <h3 className="font-medium mb-2">Ride Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600">Passenger:</div>
                      <div>{currentRide.passenger.name}</div>
                      <div className="text-gray-600">Distance:</div>
                      <div>{currentRide.distance} km</div>
                      <div className="text-gray-600">Fare:</div>
                      <div>₹{currentRide.fare}</div>
                    </div>
                  </div>

                  <Button onClick={handleResetRide} fullWidth>
                    Find New Rides
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

          <div>
            {/* Rider Earnings Component */}
            {user && (
              <RiderEarnings
                riderId={user._id}
                refreshTrigger={historyRefreshTrigger}
              />
            )}

            {rideStatus === "idle" && isAvailable && (
              <motion.div
                className="bg-[#1E2235] p-6 rounded-lg shadow-md text-white"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.2}}
              >
                <h2 className="text-xl font-semibold mb-4 text-orange-500">
                  Ride Requests
                </h2>

                {rideRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-300 mb-2">No ride requests yet</p>
                    <p className="text-sm text-gray-400">
                      New ride requests will appear here when passengers book a
                      ride near you.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rideRequests.map((request) => (
                      <div
                        key={request.ride._id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium">
                              {request.passengerName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {request.ride.distance} km • ₹{request.ride.fare}
                            </p>
                          </div>
                          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {request.ride.vehicleType}
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-start mb-2">
                            <span className="text-green-500 mr-2 mt-1">●</span>
                            <div>
                              <p className="text-xs text-gray-500">Pickup</p>
                              <p className="text-sm">
                                {request.ride.pickupLocation.address}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <span className="text-red-500 mr-2 mt-1">●</span>
                            <div>
                              <p className="text-xs text-gray-500">
                                Destination
                              </p>
                              <p className="text-sm">
                                {request.ride.destinationLocation.address}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleAcceptRide(request)}
                          fullWidth
                        >
                          Accept Ride
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* <motion.div
              className="bg-[#1E2235] p-6 rounded-lg shadow-md mt-6 text-white"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{delay: 0.4}}
            >
              <h2 className="text-xl font-semibold mb-4 text-orange-500">
                Recent Earnings
              </h2>
              <p className="text-gray-300">
                Your recent earnings will appear here.
              </p>
              {/* Earnings component will be added here
            </motion.div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;

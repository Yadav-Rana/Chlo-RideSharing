import {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from "react";
import {io} from "socket.io-client";
import AuthContext from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({children}) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const {user} = useContext(AuthContext);
  const [pendingOTPValidation, setPendingOTPValidation] = useState(null);

  useEffect(() => {
    // Initialize socket connection when user is logged in
    if (user) {
      // Use environment variable for socket URL or fallback based on environment
      const SOCKET_URL =
        import.meta.env.VITE_SOCKET_URL ||
        (import.meta.env.MODE === "production"
          ? "https://chlo-backend.onrender.com" // Replace with your actual Render URL
          : "http://localhost:5000");

      console.log(
        "SocketContext - Connecting to socket server at:",
        SOCKET_URL
      );
      console.log("SocketContext - User info:", {
        userId: user._id,
        userType: user.userType,
      });

      // Close any existing socket connection
      if (socket) {
        console.log("SocketContext - Closing existing socket connection");
        socket.removeAllListeners();
        socket.disconnect();
      }

      // Create new socket connection with explicit transports
      const newSocket = io(SOCKET_URL, {
        query: {userId: user._id, userType: user.userType},
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ["websocket", "polling"], // Explicitly set transports
        forceNew: true, // Force a new connection
        autoConnect: true, // Ensure auto connection
      });

      // Force connect if not automatically connecting
      if (!newSocket.connected) {
        console.log("SocketContext - Forcing socket connection");
        newSocket.connect();
      }

      newSocket.on("connect", () => {
        console.log("SocketContext - Socket connected with ID:", newSocket.id);
        console.log("SocketContext - User connected:", {
          userId: user._id,
          userType: user.userType,
        });
        setConnected(true);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("SocketContext - Socket disconnected, reason:", reason);
        setConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
      });

      newSocket.on("reconnect_attempt", (attemptNumber) => {
        console.log("Socket reconnection attempt:", attemptNumber);
      });

      newSocket.on("reconnect", (attemptNumber) => {
        console.log("Socket reconnected after", attemptNumber, "attempts");
        setConnected(true);
      });

      newSocket.on("reconnect_error", (error) => {
        console.error("Socket reconnection error:", error.message);
      });

      newSocket.on("reconnect_failed", () => {
        console.error("Socket reconnection failed after all attempts");
      });

      // Listen for test acknowledgment
      newSocket.on("testAck", (data) => {
        console.log("SocketContext - Test acknowledgment received:", data);
      });

      // Listen for new ride requests (for debugging)
      newSocket.on("newRideRequest", (data) => {
        console.log("SocketContext - New ride request received (debug):", data);
      });

      // Listen for test broadcasts
      newSocket.on("testBroadcast", (data) => {
        console.log("SocketContext - Test broadcast received:", data);
      });

      setSocket(newSocket);

      // Clean up on unmount
      return () => {
        console.log("Cleaning up socket connection");
        // Remove specific listeners
        newSocket.off("connect");
        newSocket.off("disconnect");
        newSocket.off("connect_error");
        newSocket.off("reconnect_attempt");
        newSocket.off("reconnect");
        newSocket.off("reconnect_error");
        newSocket.off("reconnect_failed");
        newSocket.off("testAck");
        newSocket.off("newRideRequest");
        newSocket.off("testBroadcast");

        // Then remove all remaining listeners and disconnect
        newSocket.removeAllListeners();
        newSocket.disconnect();
      };
    } else {
      // Disconnect socket when user logs out
      if (socket) {
        console.log("User logged out, disconnecting socket");
        socket.removeAllListeners();
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [user]);

  // Send ride request
  const sendRideRequest = useCallback(
    (rideData) => {
      if (socket && connected) {
        console.log(
          "SocketContext - Sending ride request with socket ID:",
          socket.id
        );
        console.log("SocketContext - Ride request data:", rideData);

        // Add timestamp if not already present
        const dataToSend = {
          ...rideData,
          timestamp: rideData.timestamp || Date.now(),
          socketId: socket.id,
        };

        socket.emit("rideRequest", dataToSend);
        console.log("SocketContext - Ride request sent");

        // Also try to emit a test event to verify socket is working
        socket.emit("test", {message: "Test event", timestamp: Date.now()});
      } else {
        console.warn("Cannot send ride request: socket not connected", {
          socketExists: !!socket,
          connected,
        });
      }
    },
    [socket, connected]
  );

  // Accept ride
  const acceptRide = useCallback(
    (rideData) => {
      if (socket && connected) {
        console.log("Accepting ride:", rideData);
        socket.emit("acceptRide", rideData);
      } else {
        console.warn("Cannot accept ride: socket not connected");
      }
    },
    [socket, connected]
  );

  // Update location
  const updateLocation = useCallback(
    (locationData) => {
      if (socket && connected) {
        // Don't log every location update to avoid console spam
        socket.emit("updateLocation", locationData);
      }
    },
    [socket, connected]
  );

  // Request OTP validation
  const validateOTP = useCallback(
    (rideId, otp, passengerId, riderId) => {
      if (socket && connected) {
        console.log("Requesting OTP validation");
        socket.emit("validateOTP", {
          rideId,
          otp,
          passengerId,
          riderId,
        });

        // Store pending validation to handle response
        setPendingOTPValidation({
          rideId,
          timestamp: Date.now(),
        });
      } else {
        console.warn("Cannot validate OTP: socket not connected");
      }
    },
    [socket, connected]
  );

  // Respond to OTP validation request
  const respondToOTPValidation = useCallback(
    (rideId, riderId, isValid) => {
      if (socket && connected) {
        console.log(
          "Responding to OTP validation:",
          isValid ? "valid" : "invalid"
        );
        socket.emit("otpValidationResponse", {
          rideId,
          riderId,
          isValid,
        });
      } else {
        console.warn("Cannot respond to OTP validation: socket not connected");
      }
    },
    [socket, connected]
  );

  // Calculate distance between two points (in km)
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }, []);

  // Convert degrees to radians
  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Check if a location is within local area radius
  const isWithinRadius = useCallback(
    (userLat, userLon, targetLat, targetLon, radius = 50) => {
      const distance = calculateDistance(
        userLat,
        userLon,
        targetLat,
        targetLon
      );
      return distance <= radius;
    },
    [calculateDistance]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        sendRideRequest,
        acceptRide,
        updateLocation,
        validateOTP,
        respondToOTPValidation,
        pendingOTPValidation,
        calculateDistance,
        isWithinRadius,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;

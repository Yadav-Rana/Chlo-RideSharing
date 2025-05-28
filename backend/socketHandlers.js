// Socket.io event handlers
const socketHandlers = (io) => {
  // Store connected riders
  const connectedRiders = new Set();

  // Store socket to user mapping
  const socketToUser = new Map();

  // Debug function to log all connected riders
  const logConnectedRiders = () => {
    console.log(`Currently connected riders: ${connectedRiders.size}`);
    if (connectedRiders.size > 0) {
      console.log(`Rider IDs: ${Array.from(connectedRiders).join(", ")}`);
    }
  };

  // Debug function to broadcast a test message to all riders
  const broadcastToRiders = (message) => {
    console.log(`Broadcasting test message to ${connectedRiders.size} riders`);
    io.to("riders").emit("testBroadcast", {
      message,
      timestamp: Date.now(),
      ridersCount: connectedRiders.size,
    });
  };

  // Set up an interval to periodically broadcast to riders for testing
  setInterval(() => {
    if (connectedRiders.size > 0) {
      broadcastToRiders("Periodic test broadcast to riders");
      logConnectedRiders();
    }
  }, 30000); // Every 30 seconds

  return {
    handleConnection: (socket) => {
      console.log(`New socket connection: ${socket.id}`);

      // Get user info from query params
      const userId = socket.handshake.query.userId;
      const userType = socket.handshake.query.userType || "unknown";

      if (userId) {
        console.log(
          `User ${userId} (${userType}) connected with socket ${socket.id}`
        );

        // Store socket to user mapping
        socketToUser.set(socket.id, {userId, userType});

        // Join user's own room
        socket.join(userId);

        // If user is a rider, add to riders set and join riders room
        if (userType === "rider") {
          connectedRiders.add(userId);
          socket.join("riders");
          console.log(
            `Rider ${userId} joined riders room. Total riders: ${connectedRiders.size}`
          );
          console.log(
            `Current riders: ${Array.from(connectedRiders).join(", ")}`
          );
        }
      }

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);

        // Get user info
        const userInfo = socketToUser.get(socket.id);
        if (userInfo) {
          const {userId, userType} = userInfo;
          console.log(`User ${userId} (${userType}) disconnected`);

          // If user is a rider, remove from riders set
          if (userType === "rider") {
            connectedRiders.delete(userId);
            console.log(
              `Rider ${userId} removed from riders set. Total riders: ${connectedRiders.size}`
            );
          }

          // Remove from socket to user mapping
          socketToUser.delete(socket.id);
        }
      });
    },

    handleRideRequest: (socket, data) => {
      console.log(`Ride request received from socket ${socket.id}`);

      // Get user info
      const userInfo = socketToUser.get(socket.id);
      if (!userInfo) {
        console.warn(
          `Cannot handle ride request: no user info for socket ${socket.id}`
        );
        return;
      }

      const {userId, userType} = userInfo;
      console.log(`Ride request from user ${userId} (${userType})`);

      // Prepare data to broadcast
      const broadcastData = {
        ...data,
        timestamp: Date.now(),
        requesterId: userId,
        requesterType: userType,
      };

      // Add pickup coordinates if available
      if (
        data.ride &&
        data.ride.pickupLocation &&
        data.ride.pickupLocation.coordinates
      ) {
        const [pickupLongitude, pickupLatitude] =
          data.ride.pickupLocation.coordinates;
        broadcastData.pickupCoordinates = {
          latitude: pickupLatitude,
          longitude: pickupLongitude,
        };
      }

      console.log(
        `Broadcasting ride request to ${connectedRiders.size} riders`
      );

      // Broadcast to riders room
      socket.to("riders").emit("newRideRequest", broadcastData);

      // Also broadcast to all sockets for debugging
      socket.broadcast.emit("newRideRequest", broadcastData);

      // Send acknowledgment to requester
      socket.emit("rideRequestAck", {
        received: true,
        timestamp: Date.now(),
        ridersCount: connectedRiders.size,
      });

      console.log("Ride request broadcast complete");
    },

    handleAcceptRide: (socket, data) => {
      console.log(`Ride acceptance received from socket ${socket.id}`);

      // Get user info
      const userInfo = socketToUser.get(socket.id);
      if (!userInfo) {
        console.warn(
          `Cannot handle ride acceptance: no user info for socket ${socket.id}`
        );
        return;
      }

      const {userId, userType} = userInfo;
      console.log(`Ride acceptance from user ${userId} (${userType})`);

      // Notify passenger
      if (data.passengerId) {
        io.to(data.passengerId).emit("rideAccepted", {
          ...data,
          riderId: userId,
          riderName: data.riderName || "Your driver",
          timestamp: Date.now(),
        });

        console.log(
          `Notified passenger ${data.passengerId} about ride acceptance`
        );
      } else {
        console.warn("Cannot notify passenger: missing passengerId");
      }
    },
  };
};

module.exports = socketHandlers;

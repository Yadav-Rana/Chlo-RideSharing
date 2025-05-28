const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const {createServer} = require("http");
const {Server} = require("socket.io");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  },
  pingTimeout: 60000, // Increase ping timeout to prevent disconnections
  connectTimeout: 30000, // Increase connection timeout
});

// Import socket handlers
const socketHandlers = require("./socketHandlers")(io);

// Socket.io connection
io.on("connection", (socket) => {
  // Handle new connection
  socketHandlers.handleConnection(socket);

  // Handle ride request
  socket.on("rideRequest", (data) => {
    socketHandlers.handleRideRequest(socket, data);
  });

  // Handle direct ride request (for testing)
  socket.on("directRideRequest", (data) => {
    console.log("Direct ride request received:", data);

    // Broadcast to all connected clients
    io.emit("newRideRequest", {
      ...data,
      direct: true,
      timestamp: Date.now(),
    });

    // Also broadcast specifically to riders room
    io.to("riders").emit("newRideRequest", {
      ...data,
      direct: true,
      toRidersRoom: true,
      timestamp: Date.now(),
    });

    console.log("Direct ride request broadcast complete");
  });

  // Handle test event
  socket.on("test", (data) => {
    console.log(`Test event received from socket ${socket.id}:`, data);
    // Send back an acknowledgment
    socket.emit("testAck", {received: true, timestamp: Date.now()});
  });

  // Handle ride acceptance
  socket.on("acceptRide", (data) => {
    socketHandlers.handleAcceptRide(socket, data);
  });

  // Handle location updates
  socket.on("updateLocation", (data) => {
    console.log("Location update received:", data.userId || "unknown user");

    // Broadcast location update to the relevant user
    if (data.recipientId) {
      io.to(data.recipientId).emit("locationUpdated", data);
      console.log(`Location update sent to ${data.recipientId}`);
    } else {
      console.warn("Cannot send location update: missing recipientId");
    }
  });

  // Handle OTP validation
  socket.on("validateOTP", (data) => {
    console.log("OTP validation request received");

    if (data.passengerId) {
      // Forward the validation request to the passenger
      io.to(data.passengerId).emit("otpValidationRequest", {
        riderId: data.riderId,
        rideId: data.rideId,
        enteredOTP: data.otp,
      });
    } else {
      console.warn("Cannot forward OTP validation: missing passengerId");
    }
  });

  // Handle OTP validation response
  socket.on("otpValidationResponse", (data) => {
    console.log("OTP validation response received");

    if (data.riderId) {
      // Forward the validation response to the rider
      io.to(data.riderId).emit("otpValidationResult", {
        rideId: data.rideId,
        isValid: data.isValid,
      });
    } else {
      console.warn("Cannot forward OTP validation response: missing riderId");
    }
  });
});

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Test route for socket.io
app.get("/api/test-socket", (req, res) => {
  // Broadcast a test message to all connected clients
  io.emit("testBroadcast", {
    message: "Test broadcast from server",
    timestamp: Date.now(),
  });
  res.json({
    success: true,
    message: "Test broadcast sent",
    connectedClients: Object.keys(io.sockets.sockets).length,
  });
});

// Test route to manually trigger a ride request
app.get("/api/test-ride-request", (req, res) => {
  // Create a test ride request
  const testRide = {
    _id: `test-${Date.now()}`,
    pickupLocation: {
      address: "Test Pickup Location",
      coordinates: [77.5946, 12.9716], // Bangalore coordinates
    },
    destinationLocation: {
      address: "Test Destination",
      coordinates: [77.6033, 12.9762],
    },
    fare: 150,
    distance: 5,
    vehicleType: "car",
    passenger: {
      _id: "test-passenger",
      name: "Test Passenger",
    },
  };

  const testRideRequest = {
    ride: testRide,
    passengerId: "test-passenger",
    passengerName: "Test Passenger",
    timestamp: Date.now(),
    isTest: true,
  };

  // Broadcast to all clients
  io.emit("newRideRequest", testRideRequest);

  // Also broadcast to riders room
  io.to("riders").emit("newRideRequest", {
    ...testRideRequest,
    toRidersRoom: true,
  });

  res.json({
    success: true,
    message: "Test ride request sent",
    rideRequest: testRideRequest,
  });
});

// Import routes
const userRoutes = require("./routes/userRoutes");
const rideRoutes = require("./routes/rideRoutes");
const riderRoutes = require("./routes/riderRoutes");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/riders", riderRoutes);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

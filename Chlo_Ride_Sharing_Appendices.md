# APPENDICES - CHLO RIDE-SHARING PLATFORM

## APPENDIX A: SOURCE CODE SNIPPETS

### APPENDIX A.1: User Model Schema (MongoDB)

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    memberSince: {
      type: Date,
      default: Date.now,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
    },
    userType: {
      type: String,
      enum: ["passenger", "rider"],
      required: [true, "Please specify user type"],
    },
    vehicle: {
      type: {
        type: String,
        enum: ["car", "bike", "auto"],
        required: function () {
          return this.userType === "rider";
        },
      },
      model: {
        type: String,
        required: function () {
          return this.userType === "rider";
        },
      },
      registrationNumber: {
        type: String,
        required: function () {
          return this.userType === "rider";
        },
      },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    isAvailable: {
      type: Boolean,
      default: function () {
        return this.userType === "rider";
      },
    },
    totalRides: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
```

### APPENDIX A.2: Ride Model Schema (MongoDB)

```javascript
const mongoose = require('mongoose');

const rideSchema = mongoose.Schema(
  {
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    pickupLocation: {
      address: {
        type: String,
        required: [true, 'Please add a pickup address'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Please add pickup coordinates'],
      },
    },
    destinationLocation: {
      address: {
        type: String,
        required: [true, 'Please add a destination address'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Please add destination coordinates'],
      },
    },
    distance: {
      type: Number, // in kilometers
      required: [true, 'Please add distance'],
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Please add duration'],
    },
    fare: {
      type: Number,
      required: [true, 'Please add fare'],
    },
    vehicleType: {
      type: String,
      enum: ['car', 'bike', 'auto'],
      required: [true, 'Please add vehicle type'],
    },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'in-progress', 'completed', 'cancelled'],
      default: 'requested',
    },
    otp: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
```

### APPENDIX A.3: Google Maps Integration

```javascript
// Map component for real-time location tracking
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

  // Calculate directions when pickup and destination are set
  useEffect(() => {
    if (!isLoaded || !map) {
      return;
    }

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
      } else {
        origin = currentLocation;
        destination = pickupLocation;
      }
    } else if (rideStatus === "in-progress") {
      // When ride is in progress, show directions from current location to destination
      origin = riderLocation || currentLocation;
      destination = destinationLocation;

      // If we don't have a destination yet, use a fallback
      if (!destination && pickupLocation) {
        destination = pickupLocation;
      }
    } else {
      // Default case - show directions between pickup and destination if available
      origin = pickupLocation;
      destination = destinationLocation;
    }

    // Calculate directions if we have both origin and destination
    if (origin && destination && showDirections && isLoaded) {
      // Format location and calculate route...
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
};
```

### APPENDIX A.4: Socket.IO Real-time Communication

```javascript
// Socket.IO connection setup
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Join a ride room
  socket.on("joinRide", (rideId) => {
    socket.join(`ride:${rideId}`);
    console.log(`Socket ${socket.id} joined ride:${rideId}`);
  });

  // Update location in real-time
  socket.on("updateLocation", (data) => {
    const { rideId, location, userType } = data;
    
    if (!rideId || !location) {
      return console.error("Invalid location update data", data);
    }
    
    console.log(`Location update for ${userType} in ride ${rideId}:`, location);
    
    // Broadcast location to everyone in the ride room except sender
    socket.to(`ride:${rideId}`).emit("locationUpdated", {
      userType,
      location,
    });
  });

  // Handle ride status changes
  socket.on("rideStatusChange", (data) => {
    const { rideId, status, userId } = data;
    
    if (!rideId || !status) {
      return console.error("Invalid ride status change data", data);
    }
    
    console.log(`Ride ${rideId} status changed to ${status} by ${userId}`);
    
    // Broadcast status change to everyone in the ride room
    io.to(`ride:${rideId}`).emit("rideStatusChanged", {
      status,
      updatedBy: userId,
      timestamp: new Date(),
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});
```

## APPENDIX B: DATABASE SCHEMA AND TABLES

### APPENDIX B.1: MongoDB Collections Overview

| Collection Name | Description |
|-----------------|-------------|
| users | Stores user information including both passengers and riders |
| rides | Stores ride information including pickup, destination, fare, etc. |
| deletedUsers | Stores backup of deleted user accounts |

### APPENDIX B.2: User Collection Schema

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|------------|
| _id | ObjectId | Unique identifier | PRIMARY KEY |
| name | String | User's full name | REQUIRED |
| memberSince | Date | Registration date | DEFAULT: Current date |
| email | String | User's email address | REQUIRED, UNIQUE |
| password | String | Hashed password | REQUIRED, MIN LENGTH: 6 |
| userType | String | Type of user | ENUM: ["passenger", "rider"], REQUIRED |
| vehicle.type | String | Vehicle type for riders | ENUM: ["car", "bike", "auto"] |
| vehicle.model | String | Vehicle model for riders | REQUIRED for riders |
| vehicle.registrationNumber | String | Vehicle registration for riders | REQUIRED for riders |
| location.type | String | GeoJSON type | DEFAULT: "Point" |
| location.coordinates | [Number] | [longitude, latitude] | DEFAULT: [0, 0] |
| isAvailable | Boolean | Rider availability status | DEFAULT: true for riders |
| totalRides | Number | Total rides completed | DEFAULT: 0 |
| createdAt | Date | Record creation timestamp | AUTO |
| updatedAt | Date | Record update timestamp | AUTO |

### APPENDIX B.3: Ride Collection Schema

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|------------|
| _id | ObjectId | Unique identifier | PRIMARY KEY |
| passenger | ObjectId | Reference to user | REQUIRED, REF: 'User' |
| rider | ObjectId | Reference to rider | REF: 'User' |
| pickupLocation.address | String | Pickup address | REQUIRED |
| pickupLocation.coordinates | [Number] | [longitude, latitude] | REQUIRED |
| destinationLocation.address | String | Destination address | REQUIRED |
| destinationLocation.coordinates | [Number] | [longitude, latitude] | REQUIRED |
| distance | Number | Distance in kilometers | REQUIRED |
| duration | Number | Duration in minutes | REQUIRED |
| fare | Number | Ride fare | REQUIRED |
| vehicleType | String | Type of vehicle | ENUM: ["car", "bike", "auto"], REQUIRED |
| status | String | Current ride status | ENUM: ["requested", "accepted", "in-progress", "completed", "cancelled"], DEFAULT: "requested" |
| otp | String | One-time password for ride verification | REQUIRED |
| startTime | Date | Ride start time | OPTIONAL |
| endTime | Date | Ride end time | OPTIONAL |
| createdAt | Date | Record creation timestamp | AUTO |
| updatedAt | Date | Record update timestamp | AUTO |

### APPENDIX B.4: DeletedUser Collection Schema

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|------------|
| _id | ObjectId | Unique identifier | PRIMARY KEY |
| originalId | ObjectId | Original user ID | REQUIRED |
| name | String | User's full name | REQUIRED |
| email | String | User's email address | REQUIRED |
| userType | String | Type of user | ENUM: ["passenger", "rider"], REQUIRED |
| memberSince | Date | Original registration date | REQUIRED |
| vehicle | Object | Vehicle information | OPTIONAL |
| totalRides | Number | Total rides completed | DEFAULT: 0 |
| deletedAt | Date | Account deletion timestamp | DEFAULT: Current date |
| createdAt | Date | Record creation timestamp | AUTO |
| updatedAt | Date | Record update timestamp | AUTO |

## APPENDIX C: API ENDPOINTS

### APPENDIX C.1: Authentication Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| /api/users | POST | Register a new user | { name, email, password, userType } | { _id, name, email, userType, token } |
| /api/users/login | POST | Login a user | { email, password } | { _id, name, email, userType, token } |

### APPENDIX C.2: User Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| /api/users/profile | GET | Get user profile | - | { _id, name, email, userType, ... } |
| /api/users/profile | PUT | Update user profile | { name, phone, vehicle, ... } | { _id, name, email, userType, ... } |
| /api/users/profile | DELETE | Delete user account | - | { message: "User account deleted successfully" } |
| /api/users/riders | GET | Get nearby riders | Query: { longitude, latitude, maxDistance } | [{ _id, name, userType, location, ... }] |

### APPENDIX C.3: Ride Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| /api/rides | POST | Create a new ride | { pickupLocation, destinationLocation, ... } | { _id, passenger, pickupLocation, ... } |
| /api/rides/:id | GET | Get ride details | - | { _id, passenger, rider, status, ... } |
| /api/rides/:id/accept | PUT | Accept a ride | - | { _id, status: "accepted", ... } |
| /api/rides/:id/start | PUT | Start a ride | { otp } | { _id, status: "in-progress", ... } |
| /api/rides/:id/complete | PUT | Complete a ride | - | { _id, status: "completed", ... } |
| /api/rides/:id/cancel | PUT | Cancel a ride | - | { _id, status: "cancelled", ... } |

### APPENDIX C.4: Contact Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| /api/contact | POST | Send contact form | { name, email, subject, message } | { success: true, message: "Email sent successfully" } |

## APPENDIX D: INSTALLATION INSTRUCTIONS

### APPENDIX D.1: Prerequisites

- Node.js (v14.0.0 or higher)
- MongoDB (v4.4 or higher)
- npm (v6.0.0 or higher)
- Google Maps API Key

### APPENDIX D.2: Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chlo-ride-sharing.git
   cd chlo-ride-sharing
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/chlo
   JWT_SECRET=your_jwt_secret
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   CONTACT_EMAIL_RECIPIENT=recipient-email@example.com
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### APPENDIX D.3: Frontend Setup

1. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

2. Create a `.env` file in the frontend directory with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:3000`

### APPENDIX D.4: Deployment

#### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment Variables: Add all variables from the `.env` file

#### Frontend Deployment (Vercel)

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Configure the following settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: Add all variables from the `.env` file

## APPENDIX E: SCREENSHOTS

### APPENDIX E.1: Landing Page
![Landing Page](https://example.com/landing-page.png)

### APPENDIX E.2: User Dashboard
![User Dashboard](https://example.com/user-dashboard.png)

### APPENDIX E.3: Ride Booking Interface
![Ride Booking](https://example.com/ride-booking.png)

### APPENDIX E.4: Rider Dashboard
![Rider Dashboard](https://example.com/rider-dashboard.png)

### APPENDIX E.5: Real-time Ride Tracking
![Ride Tracking](https://example.com/ride-tracking.png)

## APPENDIX F: TEST CASES

### APPENDIX F.1: Authentication Test Cases

| Test Case ID | Description | Input | Expected Output | Result |
|--------------|-------------|-------|-----------------|--------|
| AUTH-TC-001 | User Registration - Valid Data | { name: "John Doe", email: "john@example.com", password: "password123", userType: "passenger" } | User created successfully with 201 status | Pass |
| AUTH-TC-002 | User Registration - Invalid Email | { name: "John Doe", email: "invalid-email", password: "password123", userType: "passenger" } | 400 Bad Request with validation error | Pass |
| AUTH-TC-003 | User Registration - Short Password | { name: "John Doe", email: "john@example.com", password: "pass", userType: "passenger" } | 400 Bad Request with validation error | Pass |
| AUTH-TC-004 | User Login - Valid Credentials | { email: "john@example.com", password: "password123" } | 200 OK with user data and token | Pass |
| AUTH-TC-005 | User Login - Invalid Credentials | { email: "john@example.com", password: "wrongpassword" } | 401 Unauthorized | Pass |

### APPENDIX F.2: Ride Booking Test Cases

| Test Case ID | Description | Input | Expected Output | Result |
|--------------|-------------|-------|-----------------|--------|
| RIDE-TC-001 | Create Ride - Valid Data | { pickupLocation, destinationLocation, vehicleType: "car" } | Ride created with "requested" status | Pass |
| RIDE-TC-002 | Create Ride - Missing Location | { pickupLocation, vehicleType: "car" } | 400 Bad Request with validation error | Pass |
| RIDE-TC-003 | Accept Ride - Valid Rider | { rideId, riderId } | Ride status updated to "accepted" | Pass |
| RIDE-TC-004 | Start Ride - Valid OTP | { rideId, otp: "123456" } | Ride status updated to "in-progress" | Pass |
| RIDE-TC-005 | Start Ride - Invalid OTP | { rideId, otp: "000000" } | 400 Bad Request with error message | Pass |
| RIDE-TC-006 | Complete Ride | { rideId } | Ride status updated to "completed" | Pass |
| RIDE-TC-007 | Cancel Ride | { rideId } | Ride status updated to "cancelled" | Pass |

### APPENDIX F.3: Real-time Communication Test Cases

| Test Case ID | Description | Input | Expected Output | Result |
|--------------|-------------|-------|-----------------|--------|
| RT-TC-001 | Join Ride Room | { rideId } | Socket joins the ride room | Pass |
| RT-TC-002 | Update Location | { rideId, location, userType } | Location update broadcast to other users | Pass |
| RT-TC-003 | Ride Status Change | { rideId, status, userId } | Status change broadcast to all users in ride room | Pass |
| RT-TC-004 | Disconnect Handling | Socket disconnect | Clean disconnection, resources freed | Pass |

### APPENDIX F.4: Profile Management Test Cases

| Test Case ID | Description | Input | Expected Output | Result |
|--------------|-------------|-------|-----------------|--------|
| PROF-TC-001 | Update Profile - Basic Info | { name: "Updated Name", phone: "1234567890" } | Profile updated successfully | Pass |
| PROF-TC-002 | Update Profile - Password Change | { currentPassword: "password123", newPassword: "newpassword123" } | Password updated successfully | Pass |
| PROF-TC-003 | Update Profile - Vehicle Info | { vehicle: { type: "car", model: "Toyota Corolla", registrationNumber: "ABC123" } } | Vehicle info updated successfully | Pass |
| PROF-TC-004 | Delete Account | Confirmation dialog | Account deleted and backup created | Pass |

## APPENDIX G: THIRD-PARTY LIBRARIES AND TOOLS

### APPENDIX G.1: Backend Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| express | 4.18.2 | Web framework for Node.js |
| mongoose | 7.0.3 | MongoDB object modeling |
| jsonwebtoken | 9.0.0 | JWT authentication |
| bcryptjs | 2.4.3 | Password hashing |
| socket.io | 4.6.1 | Real-time bidirectional communication |
| cors | 2.8.5 | Cross-Origin Resource Sharing |
| dotenv | 16.0.3 | Environment variable management |
| nodemailer | 6.9.1 | Email sending functionality |

### APPENDIX G.2: Frontend Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| react | 18.2.0 | UI library |
| react-dom | 18.2.0 | DOM manipulation for React |
| react-router-dom | 6.10.0 | Routing for React |
| @react-google-maps/api | 2.18.1 | Google Maps integration |
| socket.io-client | 4.6.1 | Client for Socket.IO |
| axios | 1.3.5 | HTTP client |
| framer-motion | 10.12.4 | Animations |
| tailwindcss | 3.3.1 | Utility-first CSS framework |
| vite | 4.2.1 | Frontend build tool |

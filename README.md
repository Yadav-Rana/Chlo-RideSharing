# Chlo - Your Neighborhood Ride Sharing Platform

Chlo is a friendly local ride-sharing platform similar to Uber and Rapido, designed specifically for your community. The project is built using the MERN stack (MongoDB, Express.js, React.js, Node.js) and incorporates Google Maps API for location-based services.

## Features

- User authentication (Passenger and Rider)
- Real-time location tracking
- Ride booking and management
- OTP verification for ride security
- Fare estimation based on distance
- Rating system for passengers and riders

## Tech Stack

### Frontend

- React.js with Vite
- React Router for navigation
- Framer Motion for animations
- Tailwind CSS for styling
- Socket.io Client for real-time communication
- Google Maps API for mapping and location services

### Backend

- Node.js with Express
- MongoDB for database
- Mongoose for object modeling
- JWT for authentication
- Socket.io for real-time communication
- MVC architecture

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google Maps API key

### Installation

1. Clone the repository

```
git clone https://github.com/yourusername/chlo-ridesharing.git
cd chlo-ridesharing
```

2. Install backend dependencies

```
cd backend
npm install
```

3. Install frontend dependencies

```
cd ../frontend
npm install
```

4. Set up environment variables

   - Create a `.env` file in the backend directory based on `.env.example`
   - Create a `.env` file in the frontend directory based on `.env.example`
   - Add your MongoDB URI and Google Maps API key

5. Start the development servers

Backend:

```
cd backend
npm run dev
```

Frontend:

```
cd frontend
npm run dev
```

## Project Structure

```
chlo-ridesharing/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/users` - Register a new user
- `POST /api/users/login` - Login user

### User

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/riders` - Get nearby riders

### Rides

- `POST /api/rides` - Create a new ride request
- `GET /api/rides` - Get all rides for a user
- `GET /api/rides/:id` - Get a specific ride
- `PUT /api/rides/:id/accept` - Accept a ride
- `PUT /api/rides/:id/start` - Start a ride
- `PUT /api/rides/:id/complete` - Complete a ride
- `PUT /api/rides/:id/cancel` - Cancel a ride
- `PUT /api/rides/:id/rate` - Rate a ride

## Socket Events

### Client to Server

- `rideRequest` - Send a ride request
- `acceptRide` - Accept a ride
- `updateLocation` - Update location

### Server to Client

- `newRideRequest` - Notify riders of a new ride request
- `rideAccepted` - Notify passenger that a rider accepted their request
- `locationUpdated` - Update location of rider/passenger

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Google Maps API](https://developers.google.com/maps)
- [Socket.io](https://socket.io/)
- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)
- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

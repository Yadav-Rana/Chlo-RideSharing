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
        type: [Number], 
        required: [true, 'Please add pickup coordinates'],
      },
    },
    destinationLocation: {
      address: {
        type: String,
        required: [true, 'Please add a destination address'],
      },
      coordinates: {
        type: [Number], 
        required: [true, 'Please add destination coordinates'],
      },
    },
    distance: {
      type: Number, 
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
    passengerRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    riderRating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;

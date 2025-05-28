const Ride = require("../models/rideModel");
const User = require("../models/userModel");

// Generate a random 4-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// @desc    Create a new ride request
// @route   POST /api/rides
// @access  Private
const createRide = async (req, res) => {
  try {
    const {
      pickupLocation,
      destinationLocation,
      distance,
      duration,
      fare,
      vehicleType,
    } = req.body;

    // Validate required fields
    if (
      !pickupLocation ||
      !destinationLocation ||
      !distance ||
      !duration ||
      !fare ||
      !vehicleType
    ) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }

    // Generate OTP for ride verification
    const otp = generateOTP();

    // Create ride
    const ride = await Ride.create({
      passenger: req.user._id,
      pickupLocation,
      destinationLocation,
      distance,
      duration,
      fare,
      vehicleType,
      otp,
    });

    if (ride) {
      res.status(201).json(ride);
    } else {
      res.status(400);
      throw new Error("Invalid ride data");
    }
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// @desc    Get all rides for a user
// @route   GET /api/rides
// @access  Private
const getRides = async (req, res) => {
  try {
    let rides;

    if (req.user.userType === "passenger") {
      rides = await Ride.find({passenger: req.user._id})
        .populate("rider", "name vehicle rating")
        .sort({createdAt: -1});
    } else {
      rides = await Ride.find({rider: req.user._id})
        .populate("passenger", "name rating")
        .sort({createdAt: -1});
    }

    res.json(rides);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// @desc    Get a ride by ID
// @route   GET /api/rides/:id
// @access  Private
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("passenger", "name rating")
      .populate("rider", "name vehicle rating");

    if (ride) {
      // Check if user is authorized to view this ride
      if (
        ride.passenger._id.toString() === req.user._id.toString() ||
        (ride.rider && ride.rider._id.toString() === req.user._id.toString())
      ) {
        res.json(ride);
      } else {
        res.status(401);
        throw new Error("Not authorized to view this ride");
      }
    } else {
      res.status(404);
      throw new Error("Ride not found");
    }
  } catch (error) {
    res.status(404).json({message: error.message});
  }
};

// @desc    Accept a ride
// @route   PUT /api/rides/:id/accept
// @access  Private (Riders only)
const acceptRide = async (req, res) => {
  try {
    // Check if user is a rider
    if (req.user.userType !== "rider") {
      res.status(401);
      throw new Error("Only riders can accept rides");
    }

    const ride = await Ride.findById(req.params.id);

    if (ride) {
      // Check if ride is already accepted
      if (ride.status !== "requested") {
        res.status(400);
        throw new Error(
          "This ride has already been accepted or is no longer available"
        );
      }

      // Update ride
      ride.rider = req.user._id;
      ride.status = "accepted";

      const updatedRide = await ride.save();

      // Populate rider and passenger info
      const populatedRide = await Ride.findById(updatedRide._id)
        .populate("passenger", "name rating")
        .populate("rider", "name vehicle rating");

      res.json(populatedRide);
    } else {
      res.status(404);
      throw new Error("Ride not found");
    }
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// @desc    Start a ride
// @route   PUT /api/rides/:id/start
// @access  Private (Riders only)
const startRide = async (req, res) => {
  try {
    const {otp} = req.body;

    if (!otp) {
      res.status(400);
      throw new Error("Please provide OTP");
    }

    const ride = await Ride.findById(req.params.id);

    if (ride) {
      // Check if user is the assigned rider
      if (ride.rider.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("Not authorized to start this ride");
      }

      // Check if ride is in 'accepted' status
      if (ride.status !== "accepted") {
        res.status(400);
        throw new Error("This ride cannot be started");
      }

      // Verify OTP
      if (ride.otp !== otp) {
        res.status(400);
        throw new Error("Invalid OTP");
      }

      // Update ride
      ride.status = "in-progress";
      ride.startTime = Date.now();

      const updatedRide = await ride.save();

      // Populate rider and passenger info
      const populatedRide = await Ride.findById(updatedRide._id)
        .populate("passenger", "name rating")
        .populate("rider", "name vehicle rating");

      res.json(populatedRide);
    } else {
      res.status(404);
      throw new Error("Ride not found");
    }
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// @desc    Complete a ride
// @route   PUT /api/rides/:id/complete
// @access  Private (Riders only)
const completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (ride) {
      // Check if user is the assigned rider
      if (ride.rider.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("Not authorized to complete this ride");
      }

      // Check if ride is in 'in-progress' status
      if (ride.status !== "in-progress") {
        res.status(400);
        throw new Error("This ride cannot be completed");
      }

      // Update ride
      ride.status = "completed";
      ride.endTime = Date.now();

      const updatedRide = await ride.save();

      // Update rider's total rides
      await User.findByIdAndUpdate(ride.rider, {
        $inc: {totalRides: 1},
      });

      // Update passenger's total rides
      await User.findByIdAndUpdate(ride.passenger, {
        $inc: {totalRides: 1},
      });

      // Populate rider and passenger info
      const populatedRide = await Ride.findById(updatedRide._id)
        .populate("passenger", "name rating")
        .populate("rider", "name vehicle rating");

      res.json(populatedRide);
    } else {
      res.status(404);
      throw new Error("Ride not found");
    }
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// @desc    Cancel a ride
// @route   PUT /api/rides/:id/cancel
// @access  Private
const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (ride) {
      // Check if user is authorized to cancel this ride
      if (
        ride.passenger.toString() !== req.user._id.toString() &&
        ride.rider &&
        ride.rider.toString() !== req.user._id.toString()
      ) {
        res.status(401);
        throw new Error("Not authorized to cancel this ride");
      }

      // Check if ride can be cancelled
      if (ride.status === "completed" || ride.status === "cancelled") {
        res.status(400);
        throw new Error("This ride cannot be cancelled");
      }

      // Update ride
      ride.status = "cancelled";

      const updatedRide = await ride.save();

      // Populate rider and passenger info
      const populatedRide = await Ride.findById(updatedRide._id)
        .populate("passenger", "name rating")
        .populate("rider", "name vehicle rating");

      res.json(populatedRide);
    } else {
      res.status(404);
      throw new Error("Ride not found");
    }
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// @desc    Rate a ride
// @route   PUT /api/rides/:id/rate
// @access  Private
const rateRide = async (req, res) => {
  try {
    const {rating} = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400);
      throw new Error("Please provide a valid rating between 1 and 5");
    }

    const ride = await Ride.findById(req.params.id);

    if (ride) {
      // Check if ride is completed
      if (ride.status !== "completed") {
        res.status(400);
        throw new Error("Only completed rides can be rated");
      }

      // Check if user is passenger or rider
      if (ride.passenger.toString() === req.user._id.toString()) {
        // Passenger rating the rider
        if (ride.passengerRating) {
          res.status(400);
          throw new Error("You have already rated this ride");
        }

        ride.riderRating = rating;

        // Update rider's average rating
        const rider = await User.findById(ride.rider);
        const rides = await Ride.find({
          rider: ride.rider,
          riderRating: {$exists: true},
        });

        const totalRatings = rides.length;
        const ratingSum = rides.reduce((sum, r) => sum + r.riderRating, 0);
        const averageRating = ratingSum / totalRatings;

        await User.findByIdAndUpdate(ride.rider, {
          rating: averageRating,
        });
      } else if (ride.rider.toString() === req.user._id.toString()) {
        // Rider rating the passenger
        if (ride.riderRating) {
          res.status(400);
          throw new Error("You have already rated this ride");
        }

        ride.passengerRating = rating;

        // Update passenger's average rating
        const passenger = await User.findById(ride.passenger);
        const rides = await Ride.find({
          passenger: ride.passenger,
          passengerRating: {$exists: true},
        });

        const totalRatings = rides.length;
        const ratingSum = rides.reduce((sum, r) => sum + r.passengerRating, 0);
        const averageRating = ratingSum / totalRatings;

        await User.findByIdAndUpdate(ride.passenger, {
          rating: averageRating,
        });
      } else {
        res.status(401);
        throw new Error("Not authorized to rate this ride");
      }

      const updatedRide = await ride.save();

      // Populate rider and passenger info
      const populatedRide = await Ride.findById(updatedRide._id)
        .populate("passenger", "name rating")
        .populate("rider", "name vehicle rating");

      res.json(populatedRide);
    } else {
      res.status(404);
      throw new Error("Ride not found");
    }
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

module.exports = {
  createRide,
  getRides,
  getRideById,
  acceptRide,
  startRide,
  completeRide,
  cancelRide,
  rateRide,
};

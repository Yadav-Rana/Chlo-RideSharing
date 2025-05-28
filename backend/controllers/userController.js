const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const DeletedUser = require("../models/deletedUserModel");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {name, email, password, userType, vehicle} = req.body;

    // Check if user exists
    const userExists = await User.findOne({email});

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    // Validate required fields based on user type
    if (
      userType === "rider" &&
      (!vehicle ||
        !vehicle.type ||
        !vehicle.model ||
        !vehicle.registrationNumber)
    ) {
      res.status(400);
      throw new Error("Please provide vehicle information for rider");
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      userType,
      vehicle: userType === "rider" ? vehicle : undefined,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        vehicle: user.vehicle,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const {email, password} = req.body;

    // Check for user email
    const user = await User.findOne({email});

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        vehicle: user.vehicle,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    res.status(401).json({message: error.message});
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        vehicle: user.vehicle,
        location: user.location,
        isAvailable: user.isAvailable,
        rating: user.rating,
        totalRides: user.totalRides,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(404).json({message: error.message});
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({message: "User not found"});
    }

    // Update basic info
    if (req.body.name) {
      user.name = req.body.name;
    }

    if (req.body.phone) {
      user.phone = req.body.phone;
    }

    // Handle password change
    if (req.body.currentPassword && req.body.newPassword) {
      // Verify current password
      const isMatch = await user.matchPassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(400).json({message: "Current password is incorrect"});
      }

      // Set new password
      user.password = req.body.newPassword;
    }

    // Update vehicle info for riders
    if (user.userType === "rider" && req.body.vehicle) {
      user.vehicle = {
        ...user.vehicle,
        type: req.body.vehicle.vehicleType || user.vehicle.type,
        model: req.body.vehicle.model || user.vehicle.model,
        registrationNumber:
          req.body.vehicle.registrationNumber ||
          user.vehicle.registrationNumber,
      };
    }

    // Update location if provided
    if (req.body.location) {
      user.location = req.body.location;
    }

    // Update rider availability if provided
    if (req.body.isAvailable !== undefined && user.userType === "rider") {
      user.isAvailable = req.body.isAvailable;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      userType: updatedUser.userType,
      vehicle: updatedUser.vehicle,
      location: updatedUser.location,
      isAvailable: updatedUser.isAvailable,
      totalRides: updatedUser.totalRides,
      memberSince: updatedUser.memberSince || updatedUser.createdAt,
      createdAt: updatedUser.createdAt,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(400).json({message: error.message});
  }
};

// @desc    Get nearby riders
// @route   GET /api/users/riders
// @access  Private
const getNearbyRiders = async (req, res) => {
  try {
    const {longitude, latitude, maxDistance = 10000} = req.query; // maxDistance in meters (default 10km)

    if (!longitude || !latitude) {
      res.status(400);
      throw new Error("Please provide longitude and latitude");
    }

    const riders = await User.find({
      userType: "rider",
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    }).select("-password");

    res.json(riders);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({message: "User not found"});
    }

    // Create a backup of the user in the DeletedUser collection
    await DeletedUser.create({
      originalId: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      memberSince: user.memberSince || user.createdAt,
      vehicle: user.vehicle,
      totalRides: user.totalRides,
      rating: user.rating,
    });

    // Delete the user
    await User.findByIdAndDelete(req.user._id);

    res.json({message: "User account deleted successfully"});
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(400).json({message: error.message});
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getNearbyRiders,
  deleteUserAccount,
};

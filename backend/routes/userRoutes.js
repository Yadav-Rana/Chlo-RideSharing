const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getNearbyRiders,
  deleteUserAccount,
} = require("../controllers/userController");
const {protect} = require("../middleware/authMiddleware");

// Public routes
router.post("/", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.delete("/profile", protect, deleteUserAccount);
router.get("/riders", protect, getNearbyRiders);

// Mock data for user ride history
const mockRideHistory = [
  {
    _id: "1",
    pickupLocation: {
      address: "Lovely Professional University",
    },
    destinationLocation: {
      address: "Phagwara Junction Railway Station",
    },
    fare: 120,
    status: "completed",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    riderId: "rider1",
    riderName: "John Doe",
  },
  {
    _id: "2",
    pickupLocation: {
      address: "Jalandhar Bus Stand",
    },
    destinationLocation: {
      address: "Lovely Professional University",
    },
    fare: 350,
    status: "completed",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    riderId: "rider2",
    riderName: "Jane Smith",
  },
  {
    _id: "3",
    pickupLocation: {
      address: "Phagwara Market",
    },
    destinationLocation: {
      address: "Jalandhar City",
    },
    fare: 280,
    status: "cancelled",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    riderId: null,
    riderName: null,
  },
  {
    _id: "4",
    pickupLocation: {
      address: "Lovely Professional University",
    },
    destinationLocation: {
      address: "Amritsar Golden Temple",
    },
    fare: 850,
    status: "completed",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    riderId: "rider3",
    riderName: "Mike Johnson",
  },
];

// @desc    Get user ride history
// @route   GET /api/users/:id/rides
// @access  Private
router.get("/:id/rides", protect, (req, res) => {
  // In a real app, you would fetch this data from the database
  // For now, we'll return mock data
  res.json(mockRideHistory);
});

module.exports = router;

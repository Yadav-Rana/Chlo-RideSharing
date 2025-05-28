const express = require("express");
const router = express.Router();
const {protect} = require("../middleware/authMiddleware");

// Mock data for rider earnings
const mockEarnings = {
  today: 450,
  thisWeek: 2850,
  thisMonth: 12500,
  total: 45600,
  recentRides: [
    {
      _id: "1",
      pickupLocation: {
        address: "Phagwara Junction Railway Station",
      },
      destinationLocation: {
        address: "Lovely Professional University",
      },
      fare: 120,
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      _id: "2",
      pickupLocation: {
        address: "Lovely Professional University",
      },
      destinationLocation: {
        address: "Jalandhar Bus Stand",
      },
      fare: 350,
      completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    },
    {
      _id: "3",
      pickupLocation: {
        address: "Jalandhar City",
      },
      destinationLocation: {
        address: "Phagwara Market",
      },
      fare: 280,
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      _id: "4",
      pickupLocation: {
        address: "Phagwara Bus Stand",
      },
      destinationLocation: {
        address: "Lovely Professional University",
      },
      fare: 150,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
  ],
};

// @desc    Get rider earnings
// @route   GET /api/riders/:id/earnings
// @access  Private
router.get("/:id/earnings", protect, (req, res) => {
  // In a real app, you would fetch this data from the database
  // For now, we'll return mock data
  res.json(mockEarnings);
});

module.exports = router;

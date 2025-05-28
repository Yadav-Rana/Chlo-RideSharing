const express = require('express');
const router = express.Router();
const {
  createRide,
  getRides,
  getRideById,
  acceptRide,
  startRide,
  completeRide,
  cancelRide,
  rateRide,
} = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.route('/')
  .post(protect, createRide)
  .get(protect, getRides);

router.route('/:id')
  .get(protect, getRideById);

router.route('/:id/accept')
  .put(protect, acceptRide);

router.route('/:id/start')
  .put(protect, startRide);

router.route('/:id/complete')
  .put(protect, completeRide);

router.route('/:id/cancel')
  .put(protect, cancelRide);

router.route('/:id/rate')
  .put(protect, rateRide);

module.exports = router;

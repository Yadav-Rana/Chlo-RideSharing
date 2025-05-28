const mongoose = require('mongoose');

const deletedUserSchema = mongoose.Schema(
  {
    originalId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ['passenger', 'rider'],
      required: true,
    },
    memberSince: {
      type: Date,
      required: true,
    },
    vehicle: {
      type: {
        type: String,
        enum: ['car', 'bike', 'auto'],
      },
      model: String,
      registrationNumber: String,
    },
    totalRides: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const DeletedUser = mongoose.model('DeletedUser', deletedUserSchema);

module.exports = DeletedUser;

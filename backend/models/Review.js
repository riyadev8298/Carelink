const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caregiver",
      required: true
    },

    caregiverName: {
      type: String,
      required: true
    },

    userName: {
      type: String,
      required: true
    },

    userEmail: {
      type: String,
      default: ""
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    review: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Review", reviewSchema);
// backend/models/Feedback.js
const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    swapRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SwapRequest", // Reference to the specific swap request
      required: true,
      unique: true, // Ensure only one feedback entry per swapRequest
    },
    giver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The user who is giving the feedback
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The user who is receiving the feedback
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1, // Minimum rating of 1 star
      max: 5, // Maximum rating of 5 stars
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);

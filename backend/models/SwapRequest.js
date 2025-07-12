// backend/models/SwapRequest.js
const mongoose = require("mongoose");

const SwapRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    skillOfferedByRequester: {
      type: String,
      required: [true, "Skill offered by requester is required"],
      trim: true,
    },
    skillWantedByRequester: {
      type: String,
      required: [true, "Skill wanted by requester is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"], // Possible statuses
      default: "pending",
      required: true,
    },
    message: {
      // Optional message from requester to responder
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

module.exports = mongoose.model("SwapRequest", SwapRequestSchema);

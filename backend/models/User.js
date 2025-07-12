const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"], // Basic email regex validation
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6, // Enforce minimum password length
    },
    name: {
      type: String,
      trim: true,
      default: "", // Can be empty
    },
    location: {
      type: String,
      trim: true,
      default: "", // Can be empty
    },
    profilePhoto: {
      type: String, // Store URL to the image
      default:
        "https://res.cloudinary.com/your_cloud_name/image/upload/v1/default_avatar.png", // Placeholder for now, replace with a real default or remove
    },
    skillsOffered: {
      type: [String], // Array of strings
      default: [],
    },
    skillsWanted: {
      type: [String], // Array of strings
      default: [],
    },
    availability: {
      type: [String], // e.g., ["weekends", "evenings"]
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: true, // Profile is public by default
    },
    isAdmin: {
      type: Boolean,
      default: false, // Not an admin by default
    },
    isBanned: {
      type: Boolean,
      default: false, // Not banned by default
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps automatically
  }
);

module.exports = mongoose.model("User", UserSchema);

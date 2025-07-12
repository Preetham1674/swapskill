const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

// --- Get Current User Profile (Protected Route) ---
// GET /api/users/profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- Update User Profile (Protected Route) ---
// PUT /api/users/profile
router.put("/profile", authMiddleware, async (req, res) => {
  // Destructure fields from request body.
  // Ensure you only allow fields that users are supposed to update.
  const {
    name,
    location,
    skillsOffered,
    skillsWanted,
    availability,
    isPublic,
  } = req.body;

  // Build a userFields object based on what's provided
  const userFields = {};
  if (name !== undefined) userFields.name = name;
  if (location !== undefined) userFields.location = location;
  if (skillsOffered !== undefined) userFields.skillsOffered = skillsOffered; // Expecting an array
  if (skillsWanted !== undefined) userFields.skillsWanted = skillsWanted; // Expecting an array
  if (availability !== undefined) userFields.availability = availability; // Expecting an array
  if (isPublic !== undefined) userFields.isPublic = isPublic;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Prevent changing username or email through this route for security/simplicity
    // If you need to allow these, they'd require separate, more complex handling (e.g., email verification)

    // Update user document
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields }, // $set operator updates only the specified fields
      { new: true, runValidators: true, select: "-password" } // new: true returns the updated doc; runValidators: true runs schema validators
    );

    res.json(user); // Send back the updated user profile (without password)
  } catch (err) {
    console.error(err.message);
    // Handle specific validation errors from Mongoose
    if (err.name === "ValidationError") {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).send("Server Error");
  }
});
router.get("/", async (req, res) => {
  try {
    // Find all users where isPublic is true
    // Exclude sensitive fields like password, email (for public view), isAdmin, isBanned
    // Also exclude own user if logged in (optional, handled on frontend for now)
    const users = await User.find({ isPublic: true }).select(
      "-password -email -isAdmin -isBanned"
    );

    // Optionally, remove the current authenticated user from the list if they are Browse
    // This requires the authMiddleware, so this route would become protected
    // For now, we'll keep it public and let frontend filter if necessary.

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// --- Get Single Public User Profile by ID ---
// GET /api/users/:id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -email -isAdmin -isBanned"
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Ensure the profile is public, otherwise deny access
    if (!user.isPublic) {
      // If it's a private profile, we could return a different message or 403
      return res.status(403).json({ msg: "This profile is private." });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    // Handle invalid Object ID format gracefully
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;

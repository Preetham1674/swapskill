// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware"); // Our new admin middleware
const User = require("../models/User"); // To manage users
const SwapRequest = require("../models/SwapRequest"); // To monitor swaps
const Feedback = require("../models/Feedback"); // To monitor feedback

// --- Make a user an Admin (for initial setup) ---
// This is a temporary route, or used carefully by a super-admin/script.
// In a real app, this might be a CLI tool or direct DB update.
// For now, we'll make it protected by existing admin privilege, to promote other users.
// POST /api/admin/make-admin/:id
router.post(
  "/make-admin/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const userToMakeAdmin = await User.findById(req.params.id);
      if (!userToMakeAdmin) {
        return res.status(404).json({ msg: "User not found." });
      }

      userToMakeAdmin.isAdmin = true;
      await userToMakeAdmin.save();
      res.json({ msg: `${userToMakeAdmin.username} is now an administrator.` });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// --- Get All Users (for Admin Monitoring) ---
// GET /api/admin/users
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Fetch all users, including non-public ones, but still exclude passwords
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- Ban/Unban User ---
// PUT /api/admin/users/ban/:id
router.put(
  "/users/ban/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const userToBan = await User.findById(req.params.id);

      if (!userToBan) {
        return res.status(404).json({ msg: "User not found." });
      }

      // Prevent an admin from banning themselves or another admin (optional, but good practice)
      if (userToBan.isAdmin && userToBan._id.toString() !== req.user.id) {
        return res
          .status(400)
          .json({ msg: "Cannot ban another administrator." });
      }
      if (userToBan._id.toString() === req.user.id) {
        return res.status(400).json({ msg: "You cannot ban yourself." });
      }

      userToBan.isBanned = !userToBan.isBanned; // Toggle ban status
      await userToBan.save();

      res.json({
        msg: `User ${userToBan.username} ban status updated to ${userToBan.isBanned}.`,
        user: userToBan,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// --- Monitor All Swap Requests ---
// GET /api/admin/swaps
router.get("/swaps", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const swaps = await SwapRequest.find()
      .populate("requester", "username name")
      .populate("responder", "username name")
      .sort({ createdAt: -1 });
    res.json(swaps);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- Monitor All Feedback Logs ---
// GET /api/admin/feedback
router.get("/feedback", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("giver", "username name")
      .populate("receiver", "username name")
      .populate("swapRequest", "skillOfferedByRequester skillWantedByRequester") // Get some context for the swap
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// TO-DO: Add routes for rejecting inappropriate skill descriptions (if skills were a separate collection)
// For now, banning the user or manually editing their profile through a user update route
// (which an admin could do if given a specific route) would cover this.

// TO-DO: Add route for sending platform-wide messages

// TO-DO: Add routes for downloading reports (requires file generation/streaming)

module.exports = router;

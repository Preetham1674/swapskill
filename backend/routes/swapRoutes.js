// backend/routes/swapRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // For protected routes
const SwapRequest = require("../models/SwapRequest"); // Import the SwapRequest model
const User = require("../models/User"); // Also need User to check responder's existence/skills

// --- Create a Swap Request ---
// POST /api/swaps/request
router.post("/request", authMiddleware, async (req, res) => {
  const {
    responderId,
    skillOfferedByRequester,
    skillWantedByRequester,
    message,
  } = req.body;
  const requesterId = req.user.id; // Comes from authMiddleware

  try {
    // 1. Basic validation
    if (!responderId || !skillOfferedByRequester || !skillWantedByRequester) {
      return res
        .status(400)
        .json({
          msg: "Please provide responder, skill offered, and skill wanted.",
        });
    }

    // 2. Prevent self-swaps
    if (requesterId.toString() === responderId) {
      return res
        .status(400)
        .json({ msg: "You cannot request a swap with yourself." });
    }

    // 3. Check if responder exists and is public
    const responder = await User.findById(responderId);
    if (!responder) {
      return res.status(404).json({ msg: "Responder user not found." });
    }
    if (!responder.isPublic) {
      return res
        .status(403)
        .json({ msg: "Cannot request swap with a private profile." });
    }

    // 4. (Optional but recommended) Validate if skills actually exist for both users
    //    - Check if skillOfferedByRequester is in requester's skillsOffered
    //    - Check if skillWantedByRequester is in responder's skillsOffered
    //    For now, we'll assume the frontend will send valid skills.
    //    You can add this more rigorous validation here if needed.

    // 5. Check for existing pending swap requests between these users for these skills
    const existingSwap = await SwapRequest.findOne({
      requester: requesterId,
      responder: responderId,
      skillOfferedByRequester,
      skillWantedByRequester,
      status: "pending",
    });

    if (existingSwap) {
      return res
        .status(400)
        .json({
          msg: "A pending swap request for these skills already exists with this user.",
        });
    }

    // 6. Create new swap request
    const newSwapRequest = new SwapRequest({
      requester: requesterId,
      responder: responderId,
      skillOfferedByRequester,
      skillWantedByRequester,
      message: message || "", // Use empty string if message is not provided
    });

    // 7. Save to DB
    await newSwapRequest.save();

    res
      .status(201)
      .json({
        msg: "Swap request sent successfully!",
        swapRequest: newSwapRequest,
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

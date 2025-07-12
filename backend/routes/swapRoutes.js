// backend/routes/swapRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // For protected routes
const SwapRequest = require("../models/SwapRequest"); // Import the SwapRequest model
const User = require("../models/User"); // Also need User to check responder's existence/skills
const Feedback = require("../models/Feedback");
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
      return res.status(400).json({
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
      return res.status(400).json({
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

    res.status(201).json({
      msg: "Swap request sent successfully!",
      swapRequest: newSwapRequest,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// GET /api/swaps/my-requests
router.get("/my-requests", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find requests where the user is either the requester or the responder
    const requests = await SwapRequest.find({
      $or: [{ requester: userId }, { responder: userId }],
    })
      .populate("requester", "username name profilePhoto skillsOffered") // Populate requester's details
      .populate("responder", "username name profilePhoto skillsOffered") // Populate responder's details
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// PUT /api/swaps/:id/accept
router.put("/:id/accept", authMiddleware, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({ msg: "Swap request not found" });
    }

    // Authorization: Only the responder can accept a request
    if (swapRequest.responder.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "Not authorized to accept this request" });
    }

    // Only pending requests can be accepted
    if (swapRequest.status !== "pending") {
      return res.status(400).json({
        msg: `Cannot accept a request with status: ${swapRequest.status}`,
      });
    }

    swapRequest.status = "accepted";
    await swapRequest.save();

    // TO-DO: Implement notifications to the requester that their request was accepted.
    // TO-DO: Possibly create a "Swap Agreement" or "Session" record here.

    res.json({ msg: "Swap request accepted!", swapRequest });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- Reject a Swap Request ---
// PUT /api/swaps/:id/reject
router.put("/:id/reject", authMiddleware, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({ msg: "Swap request not found" });
    }

    // Authorization: Only the responder can reject a request
    if (swapRequest.responder.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "Not authorized to reject this request" });
    }

    // Only pending requests can be rejected
    if (swapRequest.status !== "pending") {
      return res.status(400).json({
        msg: `Cannot reject a request with status: ${swapRequest.status}`,
      });
    }

    swapRequest.status = "rejected";
    await swapRequest.save();

    // TO-DO: Implement notifications to the requester that their request was rejected.

    res.json({ msg: "Swap request rejected!", swapRequest });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- Cancel a Swap Request (by Requester) ---
// DELETE /api/swaps/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({ msg: "Swap request not found" });
    }

    // Authorization: Only the requester can cancel their own request
    if (swapRequest.requester.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "Not authorized to cancel this request" });
    }

    // Only pending requests can be cancelled via DELETE
    // If already accepted/rejected, might need a different flow or status.
    if (swapRequest.status !== "pending") {
      return res
        .status(400)
        .json({ msg: "Only pending requests can be cancelled this way." });
    }

    await SwapRequest.deleteOne({ _id: req.params.id }); // Using deleteOne for clarity

    // Alternative: Set status to 'cancelled' instead of deleting
    // swapRequest.status = 'cancelled';
    // await swapRequest.save();
    // res.json({ msg: 'Swap request cancelled!', swapRequest });

    res.json({ msg: "Swap request cancelled successfully!" }); // If actually deleted
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// POST /api/swaps/:id/feedback
router.post("/:id/feedback", authMiddleware, async (req, res) => {
  const swapRequestId = req.params.id;
  const { rating, comment } = req.body;
  const giverId = req.user.id; // User giving feedback (from JWT)

  try {
    // 1. Find the swap request
    const swapRequest = await SwapRequest.findById(swapRequestId)
      .populate("requester", "_id") // Populate only ID for checks
      .populate("responder", "_id"); // Populate only ID for checks

    if (!swapRequest) {
      return res.status(404).json({ msg: "Swap request not found." });
    }

    // 2. Check if the swap was accepted
    if (swapRequest.status !== "accepted") {
      return res
        .status(400)
        .json({ msg: "Feedback can only be submitted for accepted swaps." });
    }

    // 3. Authorization: Giver must be one of the participants of the accepted swap
    const isRequester = swapRequest.requester._id.toString() === giverId;
    const isResponder = swapRequest.responder._id.toString() === giverId;

    if (!isRequester && !isResponder) {
      return res
        .status(401)
        .json({ msg: "Not authorized to leave feedback for this swap." });
    }

    // Determine the receiver of the feedback
    const receiverId = isRequester
      ? swapRequest.responder._id
      : swapRequest.requester._id;

    // 4. Validate rating
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ msg: "Rating must be a number between 1 and 5." });
    }

    // 5. Check if feedback already exists for this swap (for this giver to this receiver)
    // Using swapRequest._id as unique, which prevents *any* feedback for this swap.
    // If you wanted each participant to leave feedback independently, you'd need a more complex unique index.
    // For now, unique:true on swapRequest in schema covers both directions.
    const existingFeedback = await Feedback.findOne({
      swapRequest: swapRequestId,
    });
    if (existingFeedback) {
      // If existing feedback is by the same giver, they are trying to submit again.
      if (existingFeedback.giver.toString() === giverId) {
        return res
          .status(400)
          .json({ msg: "You have already submitted feedback for this swap." });
      }
      // If existing feedback is by the *other* participant, this current giver can still submit.
      // This requires removing unique:true from swapRequest in schema
      // And instead making a compound unique index on {swapRequest, giver}
      // For now, with unique:true, only one overall feedback per swap is allowed.
    }
    // For allowing both participants to leave feedback for one swap:
    // 1. Remove `unique: true` from `swapRequest` in `FeedbackSchema`.
    // 2. Add a compound unique index in your model definition:
    //    `FeedbackSchema.index({ swapRequest: 1, giver: 1 }, { unique: true });`
    // 3. Modify the `existingFeedback` check here to:
    //    `const existingFeedback = await Feedback.findOne({ swapRequest: swapRequestId, giver: giverId });`
    // For simplicity, we stick to one overall feedback per swap for now.

    // 6. Create new feedback entry
    const newFeedback = new Feedback({
      swapRequest: swapRequestId,
      giver: giverId,
      receiver: receiverId,
      rating,
      comment: comment || "",
    });

    // 7. Save to DB
    await newFeedback.save();

    res
      .status(201)
      .json({ msg: "Feedback submitted successfully!", feedback: newFeedback });
  } catch (err) {
    console.error(err.message);
    // Handle duplicate key error from MongoDB for unique index
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ msg: "Feedback for this swap has already been submitted." });
    }
    res.status(500).send("Server Error");
  }
});

// --- Get Feedback Received by a User (Optional for future display on profile) ---
// GET /api/feedback/user/:userId
router.get("/user/:userId", async (req, res) => {
  try {
    const feedback = await Feedback.find({ receiver: req.params.userId })
      .populate("giver", "username name profilePhoto") // Show who gave the feedback
      .sort({ createdAt: -1 }); // Newest first

    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "User not found." });
    }
    res.status(500).send("Server Error");
  }
});
module.exports = router;

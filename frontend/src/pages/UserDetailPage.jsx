// src/pages/UserDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

// Modal component (keep it here for now or move to components/Modal.jsx if reusable elsewhere)
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    user: currentUser,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swapFormData, setSwapFormData] = useState({
    skillOfferedByRequester: "",
    skillWantedByRequester: "",
    message: "",
  });
  const [swapMessage, setSwapMessage] = useState("");
  const [swapSubmitting, setSwapSubmitting] = useState(false);

  // NEW STATES FOR FEEDBACK DISPLAY
  const [receivedFeedback, setReceivedFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);

  // --- Fetch Target User Data ---
  useEffect(() => {
    const fetchTargetUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/users/${id}`);
        setTargetUser(res.data);
      } catch (err) {
        console.error("Error fetching user detail:", err);
        setError(err.response?.data?.msg || "Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchTargetUser();
  }, [id]);

  // NEW: --- Fetch Received Feedback for Target User ---
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!targetUser) return; // Only fetch feedback if targetUser data is loaded

      try {
        setFeedbackLoading(true);
        setFeedbackError(null);
        // Using the backend route we made in Step 30
        const res = await api.get(`/swaps/user/${targetUser._id}`); // Note: it's /swaps/user/:userId
        setReceivedFeedback(res.data);

        // Calculate average rating
        if (res.data.length > 0) {
          const totalRating = res.data.reduce(
            (sum, feedback) => sum + feedback.rating,
            0
          );
          setAverageRating((totalRating / res.data.length).toFixed(1)); // To one decimal place
        } else {
          setAverageRating(0);
        }
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setFeedbackError("Failed to load feedback.");
      } finally {
        setFeedbackLoading(false);
      }
    };

    fetchFeedback();
  }, [targetUser]); // Fetch feedback when targetUser data is available/changes

  // --- Handle Swap Form Input Changes ---
  const onSwapFormChange = (e) => {
    setSwapFormData({ ...swapFormData, [e.target.name]: e.target.value });
  };

  // --- Handle Swap Request Submission ---
  const handleSendSwapRequest = async (e) => {
    e.preventDefault();
    setSwapSubmitting(true);
    setSwapMessage("");

    if (
      !swapFormData.skillOfferedByRequester ||
      !swapFormData.skillWantedByRequester
    ) {
      setSwapMessage(
        "Please select both a skill you offer and a skill you want."
      );
      setSwapSubmitting(false);
      return;
    }

    const requesterSkills = currentUser?.skillsOffered || [];
    if (!requesterSkills.includes(swapFormData.skillOfferedByRequester)) {
      setSwapMessage(
        "The skill you are offering is not listed in your profile. Please update your profile first."
      );
      setSwapSubmitting(false);
      return;
    }

    const responderSkills = targetUser?.skillsOffered || [];
    if (!responderSkills.includes(swapFormData.skillWantedByRequester)) {
      setSwapMessage(
        "The skill you are requesting is not listed in this user's offered skills."
      );
      setSwapSubmitting(false);
      return;
    }

    try {
      const res = await api.post("/swaps/request", {
        responderId: targetUser._id,
        skillOfferedByRequester: swapFormData.skillOfferedByRequester,
        skillWantedByRequester: swapFormData.skillWantedByRequester,
        message: swapFormData.message,
      });
      setSwapMessage(res.data.msg);
      setIsSwapModalOpen(false);
      setSwapFormData({
        skillOfferedByRequester: "",
        skillWantedByRequester: "",
        message: "",
      });
    } catch (err) {
      console.error(
        "Error sending swap request:",
        err.response?.data?.msg || err.message
      );
      setSwapMessage(
        `Error: ${err.response?.data?.msg || "Failed to send swap request."}`
      );
    } finally {
      setSwapSubmitting(false);
    }
  };

  // --- Loading States (Combined) ---
  if (loading || authLoading || feedbackLoading) {
    // Also check feedback loading
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-blue-500"></div>
        <p className="ml-3 text-lg text-gray-700">
          Loading profile and feedback...
        </p>
      </div>
    );
  }

  // Handle errors for primary user fetch
  if (error) {
    return (
      <div className="text-center text-red-500 text-xl p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto my-8">
        {error}
        <button
          onClick={() => navigate("/browse")}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          Go back to Browse
        </button>
      </div>
    );
  }

  if (!targetUser) {
    // Safeguard, though error should catch this
    return (
      <div className="text-center text-gray-500 text-xl p-8">
        User not found.
      </div>
    );
  }

  // Prevent user from viewing their own detail page
  if (currentUser && targetUser._id === currentUser._id) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white rounded-lg shadow-lg animate-fadeIn">
      <h2 className="text-4xl font-bold text-center mb-8 text-blue-700">
        {targetUser.name || targetUser.username}'s Profile
      </h2>

      <div className="flex flex-col items-center mb-8">
        <img
          src={targetUser.profilePhoto || "https://via.placeholder.com/150"}
          alt={targetUser.username}
          className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-300 shadow-md"
        />
        <h3 className="text-2xl font-semibold text-gray-800">
          {targetUser.name || targetUser.username}
        </h3>
        {targetUser.name && (
          <p className="text-gray-600">@{targetUser.username}</p>
        )}
        {targetUser.location && (
          <p className="text-gray-600 mt-2">📍 {targetUser.location}</p>
        )}

        {/* NEW: Average Rating Display */}
        {averageRating > 0 && (
          <div className="mt-4 flex items-center text-xl font-bold text-yellow-500">
            <span>⭐ {averageRating}</span>
            <span className="text-gray-600 text-sm ml-2">
              ({receivedFeedback.length}{" "}
              {receivedFeedback.length === 1 ? "rating" : "ratings"})
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg shadow-inner">
          <h4 className="text-xl font-semibold mb-3 text-blue-800">
            Skills Offered
          </h4>
          {targetUser.skillsOffered && targetUser.skillsOffered.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {targetUser.skillsOffered.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-200 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">No skills listed yet.</p>
          )}
        </div>

        <div className="bg-purple-50 p-6 rounded-lg shadow-inner">
          <h4 className="text-xl font-semibold mb-3 text-purple-800">
            Skills Wanted
          </h4>
          {targetUser.skillsWanted && targetUser.skillsWanted.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {targetUser.skillsWanted.map((skill, index) => (
                <span
                  key={index}
                  className="bg-purple-200 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">No skills wanted yet.</p>
          )}
        </div>
      </div>

      <div className="mb-8 bg-yellow-50 p-6 rounded-lg shadow-inner">
        <h4 className="text-xl font-semibold mb-3 text-yellow-800">
          Availability
        </h4>
        {targetUser.availability && targetUser.availability.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {targetUser.availability.map((time, index) => (
              <span
                key={index}
                className="bg-yellow-200 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full"
              >
                {time}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 italic">No availability listed.</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {isAuthenticated ? (
          <button
            onClick={() => setIsSwapModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Request Skill Swap
          </button>
        ) : (
          <p className="text-gray-600 italic">
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>{" "}
            to request a swap.
          </p>
        )}
      </div>

      {/* NEW: Received Feedback Section */}
      <div className="mt-12 bg-gray-100 p-6 rounded-lg shadow-md">
        <h4 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
          Received Feedback
        </h4>
        {feedbackLoading ? (
          <p className="text-center text-gray-600">Loading feedback...</p>
        ) : feedbackError ? (
          <p className="text-center text-red-500">{feedbackError}</p>
        ) : receivedFeedback.length === 0 ? (
          <p className="text-center text-gray-600 italic">
            No feedback received yet.
          </p>
        ) : (
          <div className="space-y-4">
            {receivedFeedback.map((feedbackItem) => (
              <div
                key={feedbackItem._id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-center mb-2">
                  <img
                    src={
                      feedbackItem.giver?.profilePhoto ||
                      "https://via.placeholder.com/40"
                    }
                    alt={feedbackItem.giver?.username || "Anonymous"}
                    className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {feedbackItem.giver?.name ||
                        feedbackItem.giver?.username ||
                        "Anonymous User"}
                    </p>
                    <p className="text-yellow-500 text-lg">
                      {"⭐".repeat(feedbackItem.rating)}
                      <span className="text-gray-500 text-sm ml-1">
                        ({feedbackItem.rating}/5)
                      </span>
                    </p>
                  </div>
                </div>
                {feedbackItem.comment && (
                  <p className="text-gray-700 text-sm mt-2 italic">
                    "{feedbackItem.comment}"
                  </p>
                )}
                <p className="text-xs text-gray-500 text-right mt-2">
                  {new Date(feedbackItem.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Swap Request Modal (Existing) */}
      <Modal isOpen={isSwapModalOpen} onClose={() => setIsSwapModalOpen(false)}>
        <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Request a Swap with {targetUser.username}
        </h3>
        {swapMessage && (
          <div
            className={`p-3 mb-4 text-center rounded-md ${
              swapMessage.includes("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {swapMessage}
          </div>
        )}
        <form onSubmit={handleSendSwapRequest}>
          <div className="mb-4">
            <label
              htmlFor="skillOfferedByRequester"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Skill You Offer:
            </label>
            <select
              id="skillOfferedByRequester"
              name="skillOfferedByRequester"
              value={swapFormData.skillOfferedByRequester}
              onChange={onSwapFormChange}
              required
              className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition duration-200"
            >
              <option value="">-- Select your skill to offer --</option>
              {currentUser &&
              currentUser.skillsOffered &&
              currentUser.skillsOffered.length > 0 ? (
                currentUser.skillsOffered.map((skill, index) => (
                  <option key={index} value={skill}>
                    {skill}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  Please add skills to your profile first.
                </option>
              )}
            </select>
            {(!currentUser ||
              !currentUser.skillsOffered ||
              currentUser.skillsOffered.length === 0) && (
              <p className="text-xs text-red-500 mt-1">
                You need to{" "}
                <Link to="/profile" className="underline text-blue-600">
                  add skills to your profile
                </Link>{" "}
                before requesting a swap.
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="skillWantedByRequester"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Skill You Want from {targetUser.username}:
            </label>
            <select
              id="skillWantedByRequester"
              name="skillWantedByRequester"
              value={swapFormData.skillWantedByRequester}
              onChange={onSwapFormChange}
              required
              className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition duration-200"
            >
              <option value="">-- Select skill you want from them --</option>
              {targetUser.skillsOffered &&
              targetUser.skillsOffered.length > 0 ? (
                targetUser.skillsOffered.map((skill, index) => (
                  <option key={index} value={skill}>
                    {skill}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  This user has no skills listed to offer.
                </option>
              )}
            </select>
            {(!targetUser ||
              !targetUser.skillsOffered ||
              targetUser.skillsOffered.length === 0) && (
              <p className="text-xs text-red-500 mt-1">
                This user has no skills offered.
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="message"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Message (Optional)
            </label>
            <textarea
              id="message"
              name="message"
              value={swapFormData.message}
              onChange={onSwapFormChange}
              rows="3"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition duration-200"
              placeholder="e.g., Hi! I saw you offer [their skill] and I offer [my skill]. Would you be interested in a swap?"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={swapSubmitting}
            >
              {swapSubmitting ? "Sending..." : "Send Swap Request"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserDetailPage;

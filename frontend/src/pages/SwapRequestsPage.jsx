// src/pages/SwapRequestsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom"; // Import Link for messages

// A simple Modal component (can be moved to src/components/Modal.jsx later)
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

const SwapRequestsPage = () => {
  const {
    user: currentUser,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const navigate = useNavigate();

  const [swapRequests, setSwapRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(""); // For action feedback (accept/reject/cancel)

  // NEW STATES FOR FEEDBACK MODAL
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [currentSwapToFeedback, setCurrentSwapToFeedback] = useState(null); // The swap object being reviewed
  const [feedbackFormData, setFeedbackFormData] = useState({
    rating: 0,
    comment: "",
  });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(""); // Feedback form specific message

  const fetchRequests = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      setMessage(""); // Clear general page messages
      const res = await api.get("/swaps/my-requests");
      setSwapRequests(res.data);
    } catch (err) {
      console.error("Error fetching swap requests:", err);
      setError(err.response?.data?.msg || "Failed to load swap requests.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isAuthenticated) {
      fetchRequests();
    }
  }, [isAuthenticated, authLoading, navigate, fetchRequests]);

  // --- Action Handlers ---
  const handleAccept = async (requestId) => {
    setMessage("");
    try {
      const res = await api.put(`/swaps/${requestId}/accept`);
      setMessage(res.data.msg);
      fetchRequests();
    } catch (err) {
      console.error("Error accepting swap:", err);
      setMessage(
        `Error accepting swap: ${
          err.response?.data?.msg || "Please try again."
        }`
      );
    }
  };

  const handleReject = async (requestId) => {
    setMessage("");
    try {
      const res = await api.put(`/swaps/${requestId}/reject`);
      setMessage(res.data.msg);
      fetchRequests();
    } catch (err) {
      console.error("Error rejecting swap:", err);
      setMessage(
        `Error rejecting swap: ${
          err.response?.data?.msg || "Please try again."
        }`
      );
    }
  };

  const handleCancel = async (requestId) => {
    setMessage("");
    if (
      !window.confirm(
        "Are you sure you want to cancel this pending swap request?"
      )
    ) {
      return;
    }
    try {
      const res = await api.delete(`/swaps/${requestId}`);
      setMessage(res.data.msg);
      fetchRequests();
    } catch (err) {
      console.error("Error canceling swap:", err);
      setMessage(
        `Error canceling swap: ${
          err.response?.data?.msg || "Please try again."
        }`
      );
    }
  };

  // --- Feedback Handlers ---
  const handleGiveFeedbackClick = (swapRequest) => {
    setCurrentSwapToFeedback(swapRequest);
    setFeedbackFormData({ rating: 0, comment: "" }); // Reset form
    setFeedbackMessage(""); // Clear any previous messages
    setIsFeedbackModalOpen(true);
  };

  const onFeedbackFormChange = (e) => {
    const { name, value } = e.target;
    setFeedbackFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value, 10) : value, // Convert rating to number
    }));
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackSubmitting(true);
    setFeedbackMessage("");

    if (
      !feedbackFormData.rating ||
      feedbackFormData.rating < 1 ||
      feedbackFormData.rating > 5
    ) {
      setFeedbackMessage("Please provide a rating between 1 and 5 stars.");
      setFeedbackSubmitting(false);
      return;
    }

    try {
      const res = await api.post(
        `/swaps/${currentSwapToFeedback._id}/feedback`,
        feedbackFormData
      );
      setFeedbackMessage(res.data.msg);
      setIsFeedbackModalOpen(false); // Close modal on success
      fetchRequests(); // Re-fetch to update status (e.g., mark as feedback given) or remove button
    } catch (err) {
      console.error(
        "Error submitting feedback:",
        err.response?.data?.msg || err.message
      );
      setFeedbackMessage(
        `Error: ${err.response?.data?.msg || "Failed to submit feedback."}`
      );
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // --- Filter Requests by Type/Status ---
  const pendingReceived = swapRequests.filter(
    (req) => req.status === "pending" && req.responder._id === currentUser._id
  );
  const pendingSent = swapRequests.filter(
    (req) => req.status === "pending" && req.requester._id === currentUser._id
  );
  const acceptedRequests = swapRequests.filter(
    (req) =>
      req.status === "accepted" &&
      (req.requester._id === currentUser._id ||
        req.responder._id === currentUser._id)
  );
  const rejectedRequests = swapRequests.filter(
    (req) =>
      req.status === "rejected" &&
      (req.requester._id === currentUser._id ||
        req.responder._id === currentUser._id)
  );
  const cancelledRequests = swapRequests.filter(
    (req) =>
      req.status === "cancelled" &&
      (req.requester._id === currentUser._id ||
        req.responder._id === currentUser._id)
  );

  // --- Loading and Error States ---
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-blue-500"></div>
        <p className="ml-3 text-lg text-gray-700">Loading swap requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-xl p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto my-8">
        {error}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center text-red-500 text-xl p-8">
        You must be logged in to view your swap requests.
      </div>
    );
  }

  // --- Helper component to render a single swap request card ---
  const SwapRequestCard = ({ request, type }) => {
    const isIncoming = type === "received";
    // Check if requester or responder object exists (populated by backend)
    const otherUser = isIncoming ? request.requester : request.responder;

    const statusColor =
      {
        pending: "bg-yellow-100 text-yellow-800",
        accepted: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        cancelled: "bg-gray-100 text-gray-800",
      }[request.status] || "bg-gray-100 text-gray-800";

    // Determine if feedback button should be shown
    // Feedback can only be given for 'accepted' swaps
    // And the giver cannot be the same as the receiver of the feedback
    const canGiveFeedback = request.status === "accepted";
    // Note: With unique:true on swapRequest in FeedbackSchema, only one feedback entry per swap.
    // To allow both sides to leave feedback, the schema needs adjustment (compound index {swapRequest, giver})
    // For now, if *any* feedback exists for this swap, the button will be hidden for both.
    // You might need to fetch feedback statuses per request to be more precise.
    // For simplicity, we'll just check if it's accepted.

    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center mb-2">
              <img
                src={
                  otherUser?.profilePhoto || "https://via.placeholder.com/50"
                } // Added optional chaining `?.`
                alt={otherUser?.username || "User"} // Added optional chaining `?.`
                className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
              />
              <h3 className="text-lg font-semibold text-gray-800">
                {isIncoming ? "From" : "To"}:{" "}
                {otherUser?.name || otherUser?.username || "Unknown User"}
              </h3>
            </div>
            <p className="text-sm text-gray-600 ml-12">
              <span className="font-medium">Offering:</span>{" "}
              {request.skillOfferedByRequester}
            </p>
            <p className="text-sm text-gray-600 ml-12">
              <span className="font-medium">Wanting:</span>{" "}
              {request.skillWantedByRequester}
            </p>
            {request.message && (
              <p className="text-sm text-gray-700 italic mt-2 ml-12">
                "{request.message}"
              </p>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
          >
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
        </div>
        <p className="text-xs text-gray-500 text-right">
          {new Date(request.createdAt).toLocaleDateString()} at{" "}
          {new Date(request.createdAt).toLocaleTimeString()}
        </p>

        {/* Actions based on status and type */}
        {request.status === "pending" && isIncoming && (
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => handleAccept(request._id)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-300"
            >
              Accept
            </button>
            <button
              onClick={() => handleReject(request._id)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-300"
            >
              Reject
            </button>
          </div>
        )}
        {request.status === "pending" && !isIncoming && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleCancel(request._id)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-300"
            >
              Cancel Request
            </button>
          </div>
        )}

        {/* NEW: Give Feedback Button */}
        {canGiveFeedback && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleGiveFeedbackClick(request)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-300"
            >
              Give Feedback
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-gray-50 rounded-lg shadow-lg animate-fadeIn">
      <h2 className="text-4xl font-bold text-center mb-8 text-blue-700">
        Your Swap Requests
      </h2>

      {message && (
        <div
          className={`p-3 mb-4 text-center rounded-md ${
            message.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {swapRequests.length === 0 ? (
        <p className="text-center text-gray-600 text-lg py-10">
          You have no swap requests yet.
          <Link to="/browse" className="text-blue-600 hover:underline ml-2">
            Browse users
          </Link>{" "}
          to send one!
        </p>
      ) : (
        <div className="space-y-10">
          {pendingReceived.length > 0 && (
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-yellow-700 mb-6 border-b pb-3">
                Incoming Pending Requests ({pendingReceived.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingReceived.map((req) => (
                  <SwapRequestCard
                    key={req._id}
                    request={req}
                    type="received"
                  />
                ))}
              </div>
            </section>
          )}

          {pendingSent.length > 0 && (
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-blue-700 mb-6 border-b pb-3">
                Outgoing Pending Requests ({pendingSent.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingSent.map((req) => (
                  <SwapRequestCard key={req._id} request={req} type="sent" />
                ))}
              </div>
            </section>
          )}

          {acceptedRequests.length > 0 && (
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-green-700 mb-6 border-b pb-3">
                Accepted Swaps ({acceptedRequests.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {acceptedRequests.map((req) => (
                  <SwapRequestCard
                    key={req._id}
                    request={req}
                    type="accepted"
                  />
                ))}
              </div>
            </section>
          )}

          {(rejectedRequests.length > 0 || cancelledRequests.length > 0) && (
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-gray-700 mb-6 border-b pb-3">
                Other Requests (
                {rejectedRequests.length + cancelledRequests.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rejectedRequests.map((req) => (
                  <SwapRequestCard
                    key={req._id}
                    request={req}
                    type="rejected"
                  />
                ))}
                {cancelledRequests.map((req) => (
                  <SwapRequestCard
                    key={req._id}
                    request={req}
                    type="cancelled"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* NEW: Feedback Submission Modal */}
      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      >
        <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Leave Feedback
        </h3>
        {feedbackMessage && (
          <div
            className={`p-3 mb-4 text-center rounded-md ${
              feedbackMessage.includes("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {feedbackMessage}
          </div>
        )}
        <form onSubmit={handleFeedbackSubmit}>
          <div className="mb-4">
            <label
              htmlFor="rating"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Rating (1-5 Stars):
            </label>
            <input
              type="number"
              id="rating"
              name="rating"
              min="1"
              max="5"
              value={feedbackFormData.rating}
              onChange={onFeedbackFormChange}
              required
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition duration-200"
              placeholder="e.g., 5"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="comment"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Comment (Optional):
            </label>
            <textarea
              id="comment"
              name="comment"
              value={feedbackFormData.comment}
              onChange={onFeedbackFormChange}
              rows="4"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition duration-200"
              placeholder="Share your experience..."
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={feedbackSubmitting}
            >
              {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SwapRequestsPage;

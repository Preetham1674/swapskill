// src/pages/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // Our API utility

const AdminDashboardPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // States for fetched data
  const [allUsers, setAllUsers] = useState([]);
  const [allSwaps, setAllSwaps] = useState([]);
  const [allFeedback, setAllFeedback] = useState([]);

  // Loading and error states
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(""); // For actions like ban/unban

  // Frontend Authorization Check: Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      // If not loading auth, and either not authenticated OR authenticated but not admin
      navigate("/"); // Redirect to home or another appropriate page
      // Or show a specific "Access Denied" message if you prefer
      // setError('Access Denied: You are not authorized to view this page.');
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Fetch all admin data
  const fetchAdminData = useCallback(async () => {
    if (!isAuthenticated || !user?.isAdmin) return; // Don't fetch if not admin

    try {
      setDataLoading(true);
      setError(null);

      const [usersRes, swapsRes, feedbackRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/swaps"),
        api.get("/admin/feedback"),
      ]);

      setAllUsers(usersRes.data);
      setAllSwaps(swapsRes.data);
      setAllFeedback(feedbackRes.data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError(err.response?.data?.msg || "Failed to load admin data.");
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated, user]); // Re-run if auth or user changes

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      fetchAdminData();
    }
  }, [isAuthenticated, user, fetchAdminData]); // Depend on user and fetchAdminData

  // --- Admin Action: Ban/Unban User ---
  const handleToggleBan = async (userId, currentStatus) => {
    setMessage("");
    try {
      const res = await api.put(`/admin/users/ban/${userId}`);
      setMessage(res.data.msg);
      fetchAdminData(); // Refresh all data after action
    } catch (err) {
      console.error("Error toggling ban status:", err);
      setMessage(
        `Error: ${err.response?.data?.msg || "Failed to update ban status."}`
      );
    }
  };

  // --- Loading and Error States ---
  if (authLoading || dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-blue-500"></div>
        <p className="ml-3 text-lg text-gray-700">Loading admin dashboard...</p>
      </div>
    );
  }

  // If user is not authenticated or not admin, redirect already handled by useEffect.
  // This is a fallback if for some reason redirection doesn't happen instantly.
  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="text-center text-red-500 text-xl p-8">
        Access Denied: You are not authorized to view this page.
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

  return (
    <div className="max-w-7xl mx-auto my-8 p-6 bg-gray-50 rounded-lg shadow-lg animate-fadeIn">
      <h2 className="text-4xl font-bold text-center mb-8 text-blue-700">
        Admin Dashboard
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

      {/* Section: All Users */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
          All Users ({allUsers.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Username</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Admin</th>
                <th className="py-3 px-6 text-left">Public</th>
                <th className="py-3 px-6 text-left">Banned</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {allUsers.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={u.profilePhoto || "https://via.placeholder.com/30"}
                        alt={u.username}
                        className="w-8 h-8 rounded-full object-cover mr-2"
                      />
                      <span>{u.username}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">{u.email}</td>
                  <td className="py-3 px-6 text-left">
                    {u.isAdmin ? "Yes" : "No"}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {u.isPublic ? "Yes" : "No"}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {u.isBanned ? "Yes" : "No"}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {u._id === user._id ? ( // Disable actions for current admin user
                      <span className="text-gray-400 italic text-xs">Self</span>
                    ) : u.isAdmin ? ( // Disable ban for other admins
                      <span className="text-gray-400 italic text-xs">
                        Admin
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggleBan(u._id, u.isBanned)}
                        className={`font-semibold py-1 px-3 rounded-full text-xs transition duration-200
                                ${
                                  u.isBanned
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                }`}
                      >
                        {u.isBanned ? "Unban" : "Ban"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section: All Swap Requests */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
          All Swap Requests ({allSwaps.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">ID</th>
                <th className="py-3 px-6 text-left">Requester</th>
                <th className="py-3 px-6 text-left">Responder</th>
                <th className="py-3 px-6 text-left">Offering</th>
                <th className="py-3 px-6 text-left">Wanting</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Created At</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {allSwaps.map((s) => (
                <tr
                  key={s._id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-6 text-left text-xs">{s._id}</td>
                  <td className="py-3 px-6 text-left">
                    {s.requester?.username || "N/A"}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {s.responder?.username || "N/A"}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {s.skillOfferedByRequester}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {s.skillWantedByRequester}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        s.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : s.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : s.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left text-xs">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section: All Feedback */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
          All Feedback ({allFeedback.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Swap ID</th>
                <th className="py-3 px-6 text-left">Giver</th>
                <th className="py-3 px-6 text-left">Receiver</th>
                <th className="py-3 px-6 text-left">Rating</th>
                <th className="py-3 px-6 text-left">Comment</th>
                <th className="py-3 px-6 text-left">Created At</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {allFeedback.map((f) => (
                <tr
                  key={f._id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-6 text-left text-xs">
                    {f.swapRequest?._id || "N/A"}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {f.giver?.username || "N/A"}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {f.receiver?.username || "N/A"}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span className="text-yellow-500 font-bold">
                      {f.rating}
                    </span>
                    /5
                  </td>
                  <td className="py-3 px-6 text-left max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                    {f.comment || "No comment"}
                  </td>
                  <td className="py-3 px-6 text-left text-xs">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;

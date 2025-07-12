// src/pages/DashboardPage.jsx
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // To access user data and authentication state
import { useNavigate } from "react-router-dom"; // For redirection

const DashboardPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth(); // Get user, auth status, and loading state
  const navigate = useNavigate();

  // Effect to redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // If not loading and not authenticated, redirect to login
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show a loading state while fetching user data or checking auth status
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-blue-500"></div>
        <p className="ml-3 text-lg text-gray-700">Loading dashboard...</p>
      </div>
    );
  }

  // If we reach here and user is null (meaning not authenticated), it means the useEffect above
  // should have redirected. This is a fallback or for very brief moments.
  if (!user) {
    return (
      <div className="text-center text-red-500 text-xl p-8">
        You must be logged in to view this page.
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg animate-fadeIn max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-8 text-blue-700">
        Welcome, {user.username}!
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info Card */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-inner">
          <h3 className="text-2xl font-semibold mb-4 text-blue-800">
            Your Profile Summary
          </h3>
          <div className="flex items-center mb-4">
            <img
              src={user.profilePhoto || "https://via.placeholder.com/100"} // Use user's photo or a placeholder
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mr-4 border-4 border-blue-300"
            />
            <div>
              <p className="text-xl font-medium text-gray-800">
                {user.name || "Set your name"}
              </p>
              <p className="text-gray-600">@{user.username}</p>
              <p className="text-gray-600">{user.email}</p>
              {user.location && (
                <p className="text-gray-600">Location: {user.location}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Profile is currently: {user.isPublic ? "Public" : "Private"}
          </p>
          <button
            // We'll create a dedicated profile edit page later
            onClick={() => navigate("/profile")}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Edit Profile
          </button>
        </div>

        {/* Skills Offered Card */}
        <div className="bg-green-50 p-6 rounded-lg shadow-inner">
          <h3 className="text-2xl font-semibold mb-4 text-green-800">
            Skills You Offer
          </h3>
          {user.skillsOffered && user.skillsOffered.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700">
              {user.skillsOffered.map((skill, index) => (
                <li key={index} className="mb-1">
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 italic">
              No skills offered yet. Add some!
            </p>
          )}
          {/* Button to edit skills will link to profile edit page */}
        </div>

        {/* Skills Wanted Card */}
        <div className="bg-yellow-50 p-6 rounded-lg shadow-inner">
          <h3 className="text-2xl font-semibold mb-4 text-yellow-800">
            Skills You Want
          </h3>
          {user.skillsWanted && user.skillsWanted.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700">
              {user.skillsWanted.map((skill, index) => (
                <li key={index} className="mb-1">
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 italic">
              No skills wanted yet. Add some!
            </p>
          )}
          {/* Button to edit skills will link to profile edit page */}
        </div>

        {/* Availability Card */}
        <div className="bg-purple-50 p-6 rounded-lg shadow-inner">
          <h3 className="text-2xl font-semibold mb-4 text-purple-800">
            Your Availability
          </h3>
          {user.availability && user.availability.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700">
              {user.availability.map((time, index) => (
                <li key={index} className="mb-1">
                  {time}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 italic">No availability set yet.</p>
          )}
          {/* Button to edit availability will link to profile edit page */}
        </div>
      </div>
      {/* We'll add current and pending swap requests here later */}
    </div>
  );
};

export default DashboardPage;

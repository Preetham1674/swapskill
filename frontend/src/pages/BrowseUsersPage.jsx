// src/pages/BrowseUsersPage.jsx
import React, { useState, useEffect } from "react";
import api from "../utils/api"; // Our API utility
import UserCard from "../components/UserCard"; // Import the new UserCard component
import { useAuth } from "../context/AuthContext"; // To get current user ID for filtering

const BrowseUsersPage = () => {
  const { user: currentUser, isLoading: authLoading } = useAuth(); // Get current user from context
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get("/users"); // Fetch all public users
        setUsers(res.data);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Empty dependency array means this runs once on component mount

  // Client-side filtering based on search query
  const filteredUsers = users.filter((userItem) => {
    // Exclude the current logged-in user from the browse list if they exist
    if (currentUser && userItem._id === currentUser._id) {
      return false;
    }

    const query = searchQuery.toLowerCase();

    // Search by username
    if (userItem.username.toLowerCase().includes(query)) return true;

    // Search by name
    if (userItem.name && userItem.name.toLowerCase().includes(query))
      return true;

    // Search by skills offered
    if (
      userItem.skillsOffered &&
      userItem.skillsOffered.some((skill) =>
        skill.toLowerCase().includes(query)
      )
    )
      return true;

    // Search by skills wanted
    if (
      userItem.skillsWanted &&
      userItem.skillsWanted.some((skill) => skill.toLowerCase().includes(query))
    )
      return true;

    return false; // No match found
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-blue-500"></div>
        <p className="ml-3 text-lg text-gray-700">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-xl p-8 bg-white rounded-lg shadow-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-lg shadow-lg animate-fadeIn">
      <h2 className="text-4xl font-bold text-center mb-8 text-blue-700">
        Browse Skill Seekers
      </h2>

      {/* Search Input */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by username, name, or skill (e.g., Photoshop)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          {searchQuery
            ? "No matching users found."
            : "No public profiles to display yet. Be the first to make yours public!"}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseUsersPage;

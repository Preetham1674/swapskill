// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading, loadUser } = useAuth();
  const navigate = useNavigate();

  // State to hold form data, for basic text fields and boolean
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    isPublic: true,
  });

  // NEW: State variables to hold the raw string input for array fields
  const [skillsOfferedInput, setSkillsOfferedInput] = useState("");
  const [skillsWantedInput, setSkillsWantedInput] = useState("");
  const [availabilityInput, setAvailabilityInput] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Effect to redirect if not authenticated or load user data into form
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    } else if (user) {
      // Populate basic text/boolean fields
      setFormData({
        name: user.name || "",
        location: user.location || "",
        isPublic: user.isPublic !== undefined ? user.isPublic : true,
      });
      // Populate NEW string input states for array fields
      setSkillsOfferedInput(user.skillsOffered?.join(", ") || "");
      setSkillsWantedInput(user.skillsWanted?.join(", ") || "");
      setAvailabilityInput(user.availability?.join(", ") || "");
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  // Handle input changes for text fields (name, location)
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
  };

  // Handle changes for checkbox (isPublic)
  const onCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
    setMessage("");
  };

  // UPDATED: Dedicated change handlers for the new string input states
  const handleSkillsOfferedChange = (e) => {
    setSkillsOfferedInput(e.target.value);
    setMessage("");
  };

  const handleSkillsWantedChange = (e) => {
    setSkillsWantedInput(e.target.value);
    setMessage("");
  };

  const handleAvailabilityChange = (e) => {
    setAvailabilityInput(e.target.value);
    setMessage("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    // NEW: Convert the string inputs to arrays just before submission
    const skillsOfferedArray = skillsOfferedInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    const skillsWantedArray = skillsWantedInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    const availabilityArray = availabilityInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    try {
      // Create a new object that combines formData and the processed arrays
      const dataToSend = {
        ...formData,
        skillsOffered: skillsOfferedArray,
        skillsWanted: skillsWantedArray,
        availability: availabilityArray,
      };

      const res = await api.put("/users/profile", dataToSend); // Send the combined data
      setMessage("Profile updated successfully!");
      loadUser(); // Re-fetch the updated user data to keep context in sync
    } catch (err) {
      console.error(
        "Error updating profile:",
        err.response?.data?.msg || err.message
      );
      setMessage(
        `Error updating profile: ${
          err.response?.data?.msg || "Please try again."
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-blue-500"></div>
        <p className="ml-3 text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-red-500 text-xl p-8">
        Access Denied. Please log in.
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg animate-fadeIn max-w-4xl mx-auto my-8">
      <h2 className="text-4xl font-bold text-center mb-8 text-blue-700">
        Edit Your Profile
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

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition duration-200"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label
              htmlFor="location"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Location (e.g., City, Country)
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition duration-200"
              placeholder="Your location"
            />
          </div>
        </div>

        {/* Profile Photo (Placeholder for actual upload) */}
        <div className="flex items-center space-x-4">
          <img
            src={user.profilePhoto || "https://via.placeholder.com/100"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
          />
          <div>
            <label
              htmlFor="profilePhoto"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Profile Photo URL (Placeholder)
            </label>
            <input
              type="text"
              id="profilePhoto"
              name="profilePhoto"
              value={user.profilePhoto || ""}
              disabled
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight bg-gray-100 cursor-not-allowed"
              placeholder="URL for your profile photo (upload coming soon!)"
            />
            <p className="text-xs text-gray-500 mt-1">
              (Actual photo upload functionality will be added in a future
              step.)
            </p>
          </div>
        </div>

        {/* Skills Offered */}
        <div>
          <label
            htmlFor="skillsOffered"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Skills You Offer (comma-separated)
          </label>
          <input
            type="text"
            id="skillsOffered"
            name="skillsOffered"
            value={skillsOfferedInput} // NEW: Uses string state
            onChange={handleSkillsOfferedChange} // NEW: Uses string handler
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition duration-200"
            placeholder="e.g., Web Development, Graphic Design, Photography"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate skills with commas.
          </p>
        </div>

        {/* Skills Wanted */}
        <div>
          <label
            htmlFor="skillsWanted"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Skills You Want (comma-separated)
          </label>
          <input
            type="text"
            id="skillsWanted"
            name="skillsWanted"
            value={skillsWantedInput} // NEW: Uses string state
            onChange={handleSkillsWantedChange} // NEW: Uses string handler
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition duration-200"
            placeholder="e.g., Public Speaking, Video Editing, Cooking"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate skills with commas.
          </p>
        </div>

        {/* Availability */}
        <div>
          <label
            htmlFor="availability"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Availability (comma-separated, e.g., Weekends, Evenings)
          </label>
          <input
            type="text"
            id="availability"
            name="availability"
            value={availabilityInput} // NEW: Uses string state
            onChange={handleAvailabilityChange} // NEW: Uses string handler
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition duration-200"
            placeholder="e.g., Weekends, Evenings, Mornings"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate availability times with commas.
          </p>
        </div>

        {/* Public/Private Profile Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={onCheckboxChange}
            className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="text-gray-700 text-sm font-bold">
            Make Profile Public (Allow others to see your profile)
          </label>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Profile"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;

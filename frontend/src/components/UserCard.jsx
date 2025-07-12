// src/components/UserCard.jsx
import React from "react";
import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
      <div className="flex items-center mb-4">
        <img
          src={user.profilePhoto || "https://via.placeholder.com/100"}
          alt={user.username}
          className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-blue-300"
        />
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {user.name || user.username}
          </h3>
          {user.name && (
            <p className="text-sm text-gray-600">@{user.username}</p>
          )}
          {user.location && (
            <p className="text-sm text-gray-600 mt-1">📍 {user.location}</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="font-medium text-gray-700 mb-2">Skills Offered:</p>
        {user.skillsOffered && user.skillsOffered.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.skillsOffered.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No skills listed</p>
        )}
      </div>

      <div>
        <p className="font-medium text-gray-700 mb-2">Skills Wanted:</p>
        {user.skillsWanted && user.skillsWanted.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.skillsWanted.map((skill, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No skills wanted</p>
        )}
      </div>
      {/* We will add a "View Profile" or "Request Swap" button here later */}
      <div className="mt-4 text-right">
        <Link
          to={`/users/${user._id}`}
          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
        >
          View Profile →
        </Link>
      </div>
    </div>
  );
};

export default UserCard;

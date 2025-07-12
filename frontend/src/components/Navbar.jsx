// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // <--- IMPORT useAuth

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth(); // <--- USE AUTH HOOK

  return (
    <nav className="bg-blue-700 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Brand */}
        <Link
          to="/"
          className="text-white text-2xl font-bold hover:text-blue-200 transition duration-300"
        >
          Skill Swap
        </Link>

        {/* Navigation Links */}
        <div className="space-x-6">
          <Link
            to="/"
            className="text-white hover:text-blue-200 transition duration-300"
          >
            Home
          </Link>
          <Link
            to="/browse"
            className="text-white hover:text-blue-200 transition duration-300"
          >
            Browse Skills
          </Link>

          {/* Conditional Links */}
          {isAuthenticated ? (
            <>
              {" "}
              {/* Fragment to group multiple elements */}
              <Link
                to="/dashboard"
                className="text-white hover:text-blue-200 transition duration-300"
              >
                Dashboard
              </Link>
              {/* We can add a link to user's own profile page here later */}
              <button
                onClick={logout} // Call logout function on click
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth(); // <--- Get 'user' from context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-blue-700 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-white text-2xl font-bold hover:text-blue-200 transition duration-300"
        >
          Skill Swap
        </Link>

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

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-white hover:text-blue-200 transition duration-300"
              >
                Dashboard
              </Link>
              <Link
                to="/swaps"
                className="text-white hover:text-blue-200 transition duration-300"
              >
                My Swaps
              </Link>
              {/* NEW ADMIN LINK BELOW */}
              {user &&
                user.isAdmin && ( // Only show if user is authenticated AND isAdmin is true
                  <Link
                    to="/admin/dashboard"
                    className="text-yellow-300 hover:text-yellow-100 font-bold transition duration-300"
                  >
                    Admin
                  </Link>
                )}
              <button
                onClick={handleLogout}
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

// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/api"; // Our configured Axios instance

// 1. Create the Auth Context
const AuthContext = createContext(null);

// Custom hook to easily use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// 2. Create the Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user data (e.g., id, username, email)
  const [token, setToken] = useState(localStorage.getItem("token")); // Stores the JWT
  const [isAuthenticated, setIsAuthenticated] = useState(false); // True if user is logged in
  const [isLoading, setIsLoading] = useState(true); // True while checking auth status (e.g., on initial load)

  // Function to load user data from the backend using the stored token
  const loadUser = async () => {
    if (token) {
      try {
        // Attach token to headers is handled by api.js interceptor
        const res = await api.get("/users/profile"); // Our protected route
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Error loading user:", err.message);
        // If token is invalid/expired, clear it
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setIsLoading(false); // Done loading, set to false regardless of auth status
  };

  // Effect to load user on initial component mount or when token changes
  useEffect(() => {
    loadUser();
  }, [token]); // Re-run if token changes (e.g., after login/logout)

  // Function to handle user registration
  const register = async (formData) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", formData);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token); // This will trigger loadUser useEffect
      setIsLoading(false);
      return { success: true, msg: res.data.msg };
    } catch (err) {
      setIsLoading(false);
      console.error(
        "Registration error:",
        err.response?.data?.msg || err.message
      );
      return {
        success: false,
        msg: err.response?.data?.msg || "Registration failed",
      };
    }
  };

  // Function to handle user login
  const login = async (formData) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token); // Store token
      setToken(res.data.token); // Update state, which will trigger loadUser
      setIsLoading(false);
      return { success: true, msg: res.data.msg };
    } catch (err) {
      setIsLoading(false);
      console.error("Login error:", err.response?.data?.msg || err.message);
      return { success: false, msg: err.response?.data?.msg || "Login failed" };
    }
  };

  // Function to handle user logout
  const logout = () => {
    localStorage.removeItem("token"); // Remove token from local storage
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    // We could also redirect the user here if desired
    console.log("User logged out.");
  };

  // The value that will be provided to consumers of this context
  const authContextValue = {
    user,
    isAuthenticated,
    isLoading,
    token,
    register,
    login,
    logout,
    loadUser, // Expose loadUser if other components need to trigger a refresh
  };

  // Provide the context value to children components
  return (
    <AuthContext.Provider value={authContextValue}>
      {isLoading ? ( // Optionally, show a loading spinner while checking auth on initial load
        <div className="flex justify-center items-center min-h-screen">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-blue-500"></div>
          <p className="ml-3 text-lg text-gray-700">Loading user data...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;

// src/utils/api.js
import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Our backend API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Get token from local storage
    if (token) {
      config.headers["x-auth-token"] = token; // Add token to 'x-auth-token' header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration or invalidity
api.interceptors.response.use(
  (response) => response, // Just return the response if successful
  (error) => {
    // If the error response status is 401 (Unauthorized) or 403 (Forbidden)
    // and the token is present, it likely means the token is invalid or expired.
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // You might want to automatically logout the user here
      // For now, we'll just log an error.
      console.error("Authentication Error: Token expired or invalid.");
      // You could also dispatch a logout action from a context here if needed.
      // For now, the user will just see the error message from the API.
    }
    return Promise.reject(error);
  }
);

export default api;

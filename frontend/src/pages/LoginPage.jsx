// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // To access login function
import { useNavigate, Link } from "react-router-dom"; // For redirection and link to register

const LoginPage = () => {
  // Access the login function and isAuthenticated state from AuthContext
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate(); // Hook to programmatically navigate

  // State for form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData; // Destructure for easier access

  // Handle input changes
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Basic validation (can be enhanced)
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    const result = await login({ email, password }); // Call login function from context

    if (result.success) {
      // Redirect to dashboard on successful login
      navigate("/dashboard");
    } else {
      // Display error message
      alert(`Login failed: ${result.msg}`); // Using alert for simplicity, replace with a toast/notification
    }
  };

  // If user is already authenticated, redirect them away from login page
  // This happens if they visit /login directly while already logged in
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md animate-fadeInUp">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Login to Your Account
        </h2>
        <form onSubmit={onSubmit}>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition duration-200"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-8">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition duration-200"
              placeholder="Enter your password"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading} // Disable button while loading/submitting
            >
              {isLoading ? "Logging In..." : "Login"}
            </button>
            <Link
              to="/register"
              className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800 transition duration-300"
            >
              Don't have an account? Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

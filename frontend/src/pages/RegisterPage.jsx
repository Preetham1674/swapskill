// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from "react"; // Don't forget useEffect this time!
import { useAuth } from "../context/AuthContext"; // To access register function
import { useNavigate, Link } from "react-router-dom"; // For redirection and link to login

const RegisterPage = () => {
  // Access the register function and isAuthenticated state from AuthContext
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate(); // Hook to programmatically navigate

  // State for form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "", // For password confirmation
  });

  const { username, email, password, password2 } = formData; // Destructure for easier access

  // Handle input changes
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Basic validation
    if (!username || !email || !password || !password2) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== password2) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    // Call register function from context
    // Only send username, email, and password to the backend
    const result = await register({ username, email, password });

    if (result.success) {
      // Redirect to dashboard on successful registration (user is automatically logged in)
      alert("Registration successful! You are now logged in."); // Optional success message
      navigate("/dashboard");
    } else {
      // Display error message
      alert(`Registration failed: ${result.msg}`); // Using alert for simplicity
    }
  };

  // If user is already authenticated, redirect them away from register page
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md animate-fadeInUp">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Create Your Account
        </h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              required
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition duration-200"
              placeholder="Choose a username"
            />
          </div>
          <div className="mb-4">
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
          <div className="mb-4">
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
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition duration-200"
              placeholder="Create a password"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password2"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={password2}
              onChange={onChange}
              required
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition duration-200"
              placeholder="Confirm your password"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
            <Link
              to="/login"
              className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800 transition duration-300"
            >
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

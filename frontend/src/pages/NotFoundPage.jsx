// src/pages/NotFoundPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-gray-50 p-8 rounded-lg shadow-md text-center">
      <h2 className="text-6xl font-extrabold text-red-600 mb-4">404</h2>
      <p className="text-2xl text-gray-800 mb-6">Page Not Found</p>
      <p className="text-lg text-gray-600 mb-8">
        Oops! The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;

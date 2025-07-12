// src/pages/HomePage.jsx
import React from "react";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)]">
      {" "}
      {/* Adjust height based on header/footer */}
      <h2 className="text-4xl font-extrabold text-blue-800 mb-6 animate-fadeIn">
        Welcome to Skill Swap Platform!
      </h2>
      <p className="text-lg text-gray-700 text-center max-w-2xl animate-slideUp">
        Connect with others to share and acquire new skills. List what you
        offer, what you need, and start swapping!
      </p>
      {/* Optional: Add call to action buttons here */}
      <div className="mt-8 space-x-4">
        <a
          href="/register"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Get Started
        </a>
        <a
          href="/browse"
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Browse Skills
        </a>
      </div>
    </div>
  );
};

export default HomePage;

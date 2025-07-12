// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import Components
import Navbar from "./components/Navbar";

// Import Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import BrowseUsersPage from "./pages/BrowseUsersPage"; // <--- NEW IMPORT
import NotFoundPage from "./pages/NotFoundPage";
// src/App.jsx
// ... other imports
import ProfilePage from "./pages/ProfilePage"; // <--- NEW IMPORT
// src/App.jsx
// ... other imports
import UserDetailPage from "./pages/UserDetailPage"; // <--- NEW IMPORT

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />

        <main className="flex-grow container mx-auto p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/browse" element={<BrowseUsersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />{" "}
            {/* <--- NEW DYNAMIC ROUTE */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <footer className="bg-gray-800 text-white p-4 text-center text-sm">
          &copy; {new Date().getFullYear()} Skill Swap Platform. All rights
          reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;

// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// --- Import Routes ---
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes"); // <--- ADD THIS LINE
const swapRoutes = require("./routes/swapRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// --- Database Connection ---
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// --- Basic Route (for testing) ---
app.get("/", (req, res) => {
  res.send("Skill Swap Platform Backend API is running!");
});

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // <--- ADD THIS LINE (mounts userRoutes under /api/users)
app.use("/api/swaps", swapRoutes);
app.use("/api/admin", adminRoutes);

// --- Start the server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

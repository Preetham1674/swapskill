const express = require("express");
const router = express.Router(); // Create a new router object
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For creating and verifying tokens
const User = require("../models/User"); // Import the User model

// --- Register User Route ---
// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 1. Check if user already exists
    // Check by email
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ msg: "User with this email already exists" });
    }

    // Check by username
    user = await User.findOne({ username });
    if (user) {
      return res
        .status(400)
        .json({ msg: "User with this username already exists" });
    }

    // 2. Create new user instance
    user = new User({
      username,
      email,
      password, // This password will be hashed before saving
    });

    // 3. Hash password
    const salt = await bcrypt.genSalt(10); // Generate a salt (random string)
    user.password = await bcrypt.hash(password, salt); // Hash the password with the salt

    // 4. Save user to database
    await user.save();

    // 5. Generate JWT token
    const payload = {
      user: {
        id: user.id, // Mongoose creates an _id field, which we can access as .id
        isAdmin: user.isAdmin, // Include isAdmin flag in the token payload
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Your secret key from .env
      { expiresIn: "1h" }, // Token expires in 1 hour
      (err, token) => {
        if (err) {
          console.error("JWT Sign Error:", err.message);
          throw err;
        }
        res.status(201).json({ msg: "Registration successful", token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- Login User Route ---
// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists by email
    let user = await User.findOne({ email });
    if (!user) {
      // Using a generic message for security purposes
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // 2. Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // 3. Generate JWT token
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" }, // Token expires in 1 hour
      (err, token) => {
        if (err) {
          console.error("JWT Sign Error:", err.message);
          throw err;
        }
        res.json({ msg: "Login successful", token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

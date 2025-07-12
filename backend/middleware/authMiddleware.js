const jwt = require("jsonwebtoken");

// This middleware will protect routes, ensuring only authenticated users can access them
module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token"); // Common practice to send token in 'x-auth-token' header

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data from token payload to the request object
    // This makes user data (like user.id, user.isAdmin) available in subsequent route handlers
    req.user = decoded.user;
    next(); // Move to the next middleware or route handler
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

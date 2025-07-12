// backend/middleware/adminMiddleware.js
module.exports = function (req, res, next) {
  // req.user is set by authMiddleware (which should run before this one)
  // If authMiddleware didn't run, or failed, req.user won't exist.
  if (!req.user || !req.user.isAdmin) {
    return res
      .status(403)
      .json({ msg: "Access denied: Not an administrator." });
  }
  next(); // User is authenticated and is an admin, proceed to the next handler
};

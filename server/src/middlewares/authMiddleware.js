const jwt = require("jsonwebtoken");

// Extract user identity from Bearer JWT or dev x-user-id header
function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const secret = process.env.JWT_SECRET || "knot_default_secret_key";
      const decoded = jwt.verify(token, secret);
      
      const userId = decoded.id || decoded.userId || decoded.sub;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Invalid token payload: user ID missing" });
      }

      req.user = { id: userId, ...decoded };
      return next();
    }

    // Dev fallback for standalone testing
    const devUserId = req.headers["x-user-id"];
    if (devUserId) {
      req.user = { id: devUserId };
      return next();
    }

    return res.status(401).json({
      success: false,
      error: "Authentication required"
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Authentication failed: " + err.message
    });
  }
}

module.exports = {
  authenticateUser
};

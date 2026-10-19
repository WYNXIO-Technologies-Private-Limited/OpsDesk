const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Please log in to continue." });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Authentication is not configured." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("_id name email role");
    if (!user) return res.status(401).json({ message: "Account no longer exists." });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Session is invalid or expired. Please log in again." });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Administrator access required." });
  }
  next();
}

module.exports = { authenticate, requireAdmin };

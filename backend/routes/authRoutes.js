const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name?.trim() || !email?.trim() || typeof password !== "string") {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: "Password must be between 8 and 128 characters." });
    }
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: "An account with this email already exists." });

    // Never accept role from public registration input.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      role: "user"
    });
    return res.status(201).json({
      message: "Registration successful.",
      user: publicUser(user)
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists." });
    console.error("Registration error:", error.message);
    return res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email?.trim() || typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Authentication is not configured." });
    }
    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );
    return res.json({ message: "Login successful.", token, user: publicUser(user) });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Login failed. Please try again." });
  }
});

router.get("/me", authenticate, (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;

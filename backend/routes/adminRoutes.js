const express = require("express");
const User = require("../models/User");
const Ticket = require("../models/Ticket");
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authenticate, requireAdmin);

router.get("/overview", async (req, res) => {
  try {
    const [totalTickets, open, inProgress, resolved, totalUsers, recentTickets] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: "Open" }),
      Ticket.countDocuments({ status: "In Progress" }),
      Ticket.countDocuments({ status: "Resolved" }),
      User.countDocuments({ role: "user" }),
      Ticket.find().populate("createdBy", "name email").populate("assignedTo", "name email").sort({ createdAt: -1 }).limit(8)
    ]);
    res.json({ stats: { totalTickets, open, inProgress, resolved, totalUsers }, recentTickets });
  } catch (error) {
    res.status(500).json({ message: "Could not load admin overview." });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("name email createdAt").sort({ createdAt: -1 }).limit(500);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Could not load users." });
  }
});

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const recipient = req.user._id;
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient })
        .populate("ticket", "title status")
        .sort({ createdAt: -1 })
        .limit(50),
      Notification.countDocuments({ recipient, isRead: false })
    ]);
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Could not load notifications:", error.message);
    res.status(500).json({ message: "Could not load notifications." });
  }
});

router.patch("/read-all", async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    res.json({ message: "Notifications marked as read.", modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Could not mark notifications as read:", error.message);
    res.status(500).json({ message: "Could not update notifications." });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid notification ID." });
    }
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found." });
    res.json({ message: "Notification marked as read.", notification });
  } catch (error) {
    console.error("Could not mark notification as read:", error.message);
    res.status(500).json({ message: "Could not update notification." });
  }
});

module.exports = router;

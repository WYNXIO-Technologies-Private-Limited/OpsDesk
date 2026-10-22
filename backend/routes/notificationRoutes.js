
const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

// Get notifications belonging to the authenticated user.
router.get("/", async (req, res) => {
  try {
    const recipient = req.user._id;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient })
        .populate("ticket", "title status")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),

      Notification.countDocuments({
        recipient,
        readAt: null,
      }),
    ]);

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Notifications fetch error:", error.message);
    res.status(500).json({
      message: "Could not load notifications.",
    });
  }
});

// Mark one of the authenticated user's notifications as read.
router.patch("/:id/read", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid notification ID.",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user._id,
        readAt: null,
      },
      { $set: { readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      const existing = await Notification.exists({
        _id: req.params.id,
        recipient: req.user._id,
      });

      return res.status(existing ? 200 : 404).json({
        message: existing
          ? "Notification already read."
          : "Notification not found.",
      });
    }

    res.json({
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error("Notification read error:", error.message);
    res.status(500).json({
      message: "Could not update notification.",
    });
  }
});

// Mark all notifications belonging to the authenticated user as read.
router.patch("/read-all", async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user._id,
        readAt: null,
      },
      { $set: { readAt: new Date() } }
    );

    res.json({
      message: "All notifications marked as read.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all read error:", error.message);
    res.status(500).json({
      message: "Could not update notifications.",
    });
  }
});

module.exports = router;

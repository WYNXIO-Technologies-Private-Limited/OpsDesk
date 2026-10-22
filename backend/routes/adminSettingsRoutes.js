
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const {
  authenticate,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate, requireAdmin);

function publicAdmin(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    notificationPreferences: user.notificationPreferences,
  };
}

// GET /api/admin/settings
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "Administrator account not found.",
      });
    }

    res.json({ user: publicAdmin(user) });
  } catch (error) {
    console.error("Get admin settings error:", error);
    res.status(500).json({
      message: "Could not load administrator settings.",
    });
  }
});

// PATCH /api/admin/settings/profile
router.patch("/profile", async (req, res) => {
  try {
    const name =
      typeof req.body?.name === "string"
        ? req.body.name.trim()
        : "";

    if (!name || name.length > 100) {
      return res.status(400).json({
        message: "Name must contain 1–100 characters.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "Administrator account not found.",
      });
    }

    res.json({
      message: "Profile updated successfully.",
      user: publicAdmin(user),
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    res.status(500).json({
      message: "Could not update administrator profile.",
    });
  }
});

// PATCH /api/admin/settings/password
router.patch("/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message: "Current and new passwords are required.",
      });
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({
        message: "New password must contain 8–128 characters.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "Choose a different new password.",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "Administrator account not found.",
      });
    }

    const matches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!matches) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change admin password error:", error);
    res.status(500).json({
      message: "Could not change password.",
    });
  }
});

// PATCH /api/admin/settings/notifications
router.patch("/notifications", async (req, res) => {
  try {
    const allowedKeys = [
      "ticketCreated",
      "ticketStatusChanged",
      "ticketAssigned",
    ];

    const preferences = req.body?.notificationPreferences;

    if (
      !preferences ||
      typeof preferences !== "object" ||
      Array.isArray(preferences)
    ) {
      return res.status(400).json({
        message: "Notification preferences are required.",
      });
    }

    for (const key of allowedKeys) {
      if (
        Object.prototype.hasOwnProperty.call(preferences, key) &&
        typeof preferences[key] !== "boolean"
      ) {
        return res.status(400).json({
          message: `Invalid notification preference: ${key}.`,
        });
      }
    }

    const updates = {};

    for (const key of allowedKeys) {
      if (Object.prototype.hasOwnProperty.call(preferences, key)) {
        updates[`notificationPreferences.${key}`] =
          preferences[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid notification preferences provided.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "Administrator account not found.",
      });
    }

    res.json({
      message: "Notification preferences saved.",
      user: publicAdmin(user),
    });
  } catch (error) {
    console.error("Save notification preferences error:", error);
    res.status(500).json({
      message: "Could not save notification preferences.",
    });
  }
});

module.exports = router;

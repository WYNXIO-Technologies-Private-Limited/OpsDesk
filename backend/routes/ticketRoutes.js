
const express = require("express");
const mongoose = require("mongoose");

const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Notification = require("../models/Notification");

const {
  authenticate,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

// Notifications must never cause a successfully saved ticket operation
// to fail. Log notification errors separately.
async function createNotifications(items) {
  if (!items.length) return;

  try {
    await Notification.insertMany(items, { ordered: false });
  } catch (error) {
    console.error("Notification creation error:", error.message);
  }
}

function notification(recipient, title, message, type, ticketId) {
  return {
    recipient,
    title,
    message,
    type,
    ticket: ticketId,
  };
}

// Get tickets: admins see all, users see their own.
router.get("/", async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {}
        : { createdBy: req.user._id };

    const tickets = await Ticket.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ tickets });
  } catch (error) {
    console.error("Ticket fetch error:", error.message);
    res.status(500).json({
      message: "Could not load tickets.",
    });
  }
});

// Create ticket; notify its creator and all administrators.
router.post("/", async (req, res) => {
  try {
    const { title, description, category, priority } = req.body || {};

    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      !title.trim() ||
      !description.trim()
    ) {
      return res.status(400).json({
        message: "Ticket title and description are required.",
      });
    }

    if (title.trim().length > 160 || description.trim().length > 5000) {
      return res.status(400).json({
        message: "Ticket title or description is too long.",
      });
    }

    const allowedPriorities = ["Low", "Medium", "High"];
    const safePriority = priority || "Medium";

    if (!allowedPriorities.includes(safePriority)) {
      return res.status(400).json({
        message: "Invalid priority.",
      });
    }

    const ticket = await Ticket.create({
      title: title.trim(),
      description: description.trim(),
      category: String(category || "General").trim().slice(0, 80),
      priority: safePriority,
      createdBy: req.user._id,
    });

    const [populated, admins] = await Promise.all([
      ticket.populate("createdBy", "name email"),
      User.find({ role: "admin" }).select("_id"),
    ]);

    const notifications = [
      notification(
        req.user._id,
        "Ticket submitted successfully",
        `Your ticket "${ticket.title}" has been created.`,
        "ticket_created",
        ticket._id
      ),
      ...admins.map((admin) =>
        notification(
          admin._id,
          "New support ticket",
          `${req.user.name} submitted "${ticket.title}".`,
          "ticket_created",
          ticket._id
        )
      ),
    ];

    await createNotifications(notifications);

    res.status(201).json({
      message: "Ticket created successfully.",
      ticket: populated,
    });
  } catch (error) {
    console.error("Ticket creation error:", error.message);
    res.status(500).json({
      message: "Could not create ticket.",
    });
  }
});

// Admin changes ticket status; notify the ticket creator.
router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid ticket ID.",
      });
    }

    const allowedStatuses = ["Open", "In Progress", "Resolved"];

    if (!allowedStatuses.includes(req.body?.status)) {
      return res.status(400).json({
        message: "Invalid ticket status.",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found.",
      });
    }

    const previousStatus = ticket.status;
    const newStatus = req.body.status;

    if (previousStatus !== newStatus) {
      ticket.status = newStatus;
      await ticket.save();

      await createNotifications([
        notification(
          ticket.createdBy,
          "Ticket status updated",
          `"${ticket.title}" changed from ${previousStatus} to ${newStatus}.`,
          "status_changed",
          ticket._id
        ),
      ]);
    }

    await ticket.populate("createdBy", "name email");
    await ticket.populate("assignedTo", "name email");

    res.json({
      message:
        previousStatus === newStatus
          ? "Ticket status unchanged."
          : "Ticket status updated.",
      ticket,
    });
  } catch (error) {
    console.error("Ticket status update error:", error.message);
    res.status(500).json({
      message: "Could not update ticket status.",
    });
  }
});

// Admin assigns a ticket.
router.patch("/:id/assign", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid ticket ID.",
      });
    }

    const assigneeId = req.body?.assignedTo || null;

    if (assigneeId && !mongoose.isValidObjectId(assigneeId)) {
      return res.status(400).json({
        message: "Invalid assignee ID.",
      });
    }

    if (assigneeId) {
      const assignee = await User.findOne({
        _id: assigneeId,
        role: "admin",
      });

      if (!assignee) {
        return res.status(400).json({
          message: "Assignee must be an administrator.",
        });
      }
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo: assigneeId },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found.",
      });
    }

    res.json({
      message: "Ticket assignment updated.",
      ticket,
    });
  } catch (error) {
    console.error("Ticket assignment error:", error.message);
    res.status(500).json({
      message: "Could not assign ticket.",
    });
  }
});

module.exports = router;

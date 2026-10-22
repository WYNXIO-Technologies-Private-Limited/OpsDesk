const express = require("express");
const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const tickets = await Ticket.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ message: "Could not load tickets." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, category, priority } = req.body || {};
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ message: "Ticket title and description are required." });
    }
    if (title.trim().length > 160 || description.trim().length > 5000) {
      return res.status(400).json({ message: "Ticket title or description is too long." });
    }
    const allowedPriorities = ["Low", "Medium", "High"];
    const safePriority = priority || "Medium";
    if (!allowedPriorities.includes(safePriority)) {
      return res.status(400).json({ message: "Invalid priority." });
    }
    const ticket = await Ticket.create({
      title: title.trim(),
      description: description.trim(),
      category: String(category || "General").trim().slice(0, 80),
      priority: safePriority,
      createdBy: req.user._id
    });
    const populated = await ticket.populate("createdBy", "name email");
    try {
      const admins = await User.find({ role: "admin" }).select("_id");
      const notifications = [
        {
          recipient: req.user._id,
          ticket: ticket._id,
          type: "ticket_created",
          title: "Ticket submitted",
          message: `Your ticket “${ticket.title}” was submitted successfully.`
        },
        ...admins.map((admin) => ({
          recipient: admin._id,
          ticket: ticket._id,
          type: "new_ticket",
          title: "New ticket submitted",
          message: `${req.user.name} submitted “${ticket.title}”.`
        }))
      ];
      await Notification.insertMany(notifications);
    } catch (notificationError) {
      console.error("Could not create ticket notifications:", notificationError.message);
    }
    res.status(201).json({ message: "Ticket created.", ticket: populated });
  } catch (error) {
    res.status(500).json({ message: "Could not create ticket." });
  }
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ticket ID." });
    const allowed = ["Open", "In Progress", "Resolved"];
    if (!allowed.includes(req.body?.status)) return res.status(400).json({ message: "Invalid ticket status." });
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found." });
    const previousStatus = ticket.status;
    ticket.status = req.body.status;
    await ticket.save();
    await ticket.populate("createdBy", "name email");
    await ticket.populate("assignedTo", "name email");
    if (previousStatus !== ticket.status) {
      try {
        await Notification.create({
          recipient: ticket.createdBy._id,
          ticket: ticket._id,
          type: "status_changed",
          title: "Ticket status updated",
          message: `“${ticket.title}” changed from ${previousStatus} to ${ticket.status}.`
        });
      } catch (notificationError) {
        console.error("Could not create status notification:", notificationError.message);
      }
    }
    res.json({ message: "Ticket status updated.", ticket });
  } catch (error) {
    res.status(500).json({ message: "Could not update ticket." });
  }
});

router.patch("/:id/assign", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid ticket ID." });
    const assigneeId = req.body?.assignedTo || null;
    if (assigneeId && !mongoose.isValidObjectId(assigneeId)) return res.status(400).json({ message: "Invalid assignee ID." });
    if (assigneeId) {
      const assignee = await User.findOne({ _id: assigneeId, role: "admin" });
      if (!assignee) return res.status(400).json({ message: "Assignee must be an administrator." });
    }
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id, { assignedTo: assigneeId }, { new: true, runValidators: true }
    ).populate("createdBy", "name email").populate("assignedTo", "name email");
    if (!ticket) return res.status(404).json({ message: "Ticket not found." });
    res.json({ message: "Ticket assigned.", ticket });
  } catch (error) {
    res.status(500).json({ message: "Could not assign ticket." });
  }
});

module.exports = router;

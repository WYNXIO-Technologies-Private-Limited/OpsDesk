
const express = require("express");
const User = require("../models/User");
const Ticket = require("../models/Ticket");
const {
  authenticate,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All endpoints in this router require administrator access.
router.use(authenticate, requireAdmin);

function parseDateRange(query) {
  const { from, to } = query;
  const filter = {};

  if (from) {
    const start = new Date(`${from}T00:00:00.000Z`);

    if (Number.isNaN(start.getTime())) {
      throw new Error("Invalid start date.");
    }

    filter.$gte = start;
  }

  if (to) {
    const end = new Date(`${to}T23:59:59.999Z`);

    if (Number.isNaN(end.getTime())) {
      throw new Error("Invalid end date.");
    }

    filter.$lte = end;
  }

  if (from && to && from > to) {
    throw new Error("Start date cannot be after end date.");
  }

  return Object.keys(filter).length
    ? { createdAt: filter }
    : {};
}

function handleDateError(error, res) {
  if (
    error.message === "Invalid start date." ||
    error.message === "Invalid end date." ||
    error.message === "Start date cannot be after end date."
  ) {
    return res.status(400).json({ message: error.message });
  }

  console.error("Admin API error:", error);
  return res.status(500).json({
    message: "Unable to load administrator data.",
  });
}

// GET /api/admin/overview?from=2026-10-01&to=2026-10-31
router.get("/overview", async (req, res) => {
  try {
    const dateFilter = parseDateRange(req.query);

    const [
      totalTickets,
      open,
      inProgress,
      resolved,
      totalUsers,
      recentTickets,
      trend,
    ] = await Promise.all([
      Ticket.countDocuments(dateFilter),
      Ticket.countDocuments({
        ...dateFilter,
        status: "Open",
      }),
      Ticket.countDocuments({
        ...dateFilter,
        status: "In Progress",
      }),
      Ticket.countDocuments({
        ...dateFilter,
        status: "Resolved",
      }),
      User.countDocuments({ role: "user" }),
      Ticket.find(dateFilter)
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 })
        .limit(8),
      Ticket.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "UTC",
              },
            },
            total: { $sum: 1 },
            open: {
              $sum: {
                $cond: [{ $eq: ["$status", "Open"] }, 1, 0],
              },
            },
            inProgress: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "In Progress"] },
                  1,
                  0,
                ],
              },
            },
            resolved: {
              $sum: {
                $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      stats: {
        totalTickets,
        open,
        inProgress,
        resolved,
        totalUsers,
        resolutionRate: totalTickets
          ? Math.round((resolved / totalTickets) * 100)
          : 0,
      },
      recentTickets,
      trend: trend.map((item) => ({
        date: item._id,
        total: item.total,
        open: item.open,
        inProgress: item.inProgress,
        resolved: item.resolved,
      })),
    });
  } catch (error) {
    return handleDateError(error, res);
  }
});

// GET /api/admin/reports?from=2026-10-01&to=2026-10-31
router.get("/reports", async (req, res) => {
  try {
    const dateFilter = parseDateRange(req.query);

    const [total, open, inProgress, resolved, tickets] =
      await Promise.all([
        Ticket.countDocuments(dateFilter),
        Ticket.countDocuments({
          ...dateFilter,
          status: "Open",
        }),
        Ticket.countDocuments({
          ...dateFilter,
          status: "In Progress",
        }),
        Ticket.countDocuments({
          ...dateFilter,
          status: "Resolved",
        }),
        Ticket.find(dateFilter)
          .populate("createdBy", "name email")
          .populate("assignedTo", "name email")
          .sort({ createdAt: -1 })
          .limit(5000),
      ]);

    res.json({
      summary: {
        total,
        open,
        inProgress,
        resolved,
        resolutionRate: total
          ? Math.round((resolved / total) * 100)
          : 0,
      },
      tickets,
    });
  } catch (error) {
    return handleDateError(error, res);
  }
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .limit(500);

    res.json({ users });
  } catch (error) {
    console.error("Load users error:", error);
    res.status(500).json({
      message: "Could not load users.",
    });
  }
});

module.exports = router;

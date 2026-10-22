const notificationRoutes = require("./routes/notificationRoutes");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminSettingsRoutes = require("./routes/adminSettingsRoutes");

const app = express();

const allowedOrigin =
  process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.disable("x-powered-by");

app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: "20kb" }));

// Health check
app.get("/", (_req, res) => {
  res.json({ message: "OpsDesk API is running." });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled API error:", err.message);

  res.status(500).json({
    message: "Unexpected server error.",
  });
});

// Start server after connecting to MongoDB
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`OpsDesk API listening on ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Startup failed:", error.message);
    process.exit(1);
  });

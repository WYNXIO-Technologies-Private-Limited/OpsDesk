require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const connectDB = require("../config/db");

async function seedAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 12 characters in backend/.env");
  }
  await connectDB();
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const existing = await User.findOne({ email }).select("+password");
  if (existing) {
    existing.name = ADMIN_NAME.trim();
    existing.password = hash;
    existing.role = "admin";
    await existing.save();
    console.log("Existing account promoted/updated as admin:", email);
  } else {
    await User.create({ name: ADMIN_NAME.trim(), email, password: hash, role: "admin" });
    console.log("Admin account created:", email);
  }
}

seedAdmin()
  .catch((error) => { console.error("Admin seed failed:", error.message); process.exitCode = 1; })
  .finally(async () => { await mongoose.disconnect().catch(() => {}); });

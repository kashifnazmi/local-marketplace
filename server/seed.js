// Seed script - creates an admin user
// Usage: node seed.js
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");

dotenv.config();

const seedAdmin = async () => {
  await connectDB();

  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    console.log("Admin already exists:", existingAdmin.email);
    process.exit();
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("Admin@123", salt);

  const admin = await User.create({
    name: "Super Admin",
    email: "admin@marketplace.com",
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin created:", admin.email, "| password: Admin@123");
  process.exit();
};

seedAdmin();

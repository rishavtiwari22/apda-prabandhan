/**
 * Admin Seed Script
 * Creates the first Super Admin (Collector) account.
 *
 * Usage:
 *   node src/scripts/seedAdmin.js
 *
 * This should be run ONCE during initial deployment.
 * The admin can then create department users via the portal.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/user.model");
const { ROLES } = require("../constants/roles");

const ADMIN_DATA = {
  name: "Collector Admin",
  mobile: "9999999999",
  aadhaar: "999999999999",
  password: "admin123456",
  role: ROLES.ADMIN,
  isActive: true,
};

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: ROLES.ADMIN });
    if (existingAdmin) {
      console.log("⚠️  Admin already exists:");
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Mobile: ${existingAdmin.mobile}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log("\n   If you need to reset, delete the user from DB first.");
      process.exit(0);
    }

    // Create admin
    const admin = await User.create(ADMIN_DATA);

    console.log("\n✅ Super Admin (Collector) created successfully!\n");
    console.log("   ┌──────────────────────────────────────┐");
    console.log(`   │  Name:     ${admin.name.padEnd(27)}│`);
    console.log(`   │  Mobile:   ${admin.mobile.padEnd(27)}│`);
    console.log(`   │  Aadhaar:  ${admin.aadhaar.padEnd(27)}│`);
    console.log(`   │  Password: ${ADMIN_DATA.password.padEnd(27)}│`);
    console.log(`   │  Role:     ${admin.role.padEnd(27)}│`);
    console.log("   └──────────────────────────────────────┘");
    console.log("\n   ⚠️  CHANGE THE PASSWORD AFTER FIRST LOGIN!\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();

/**
 * Test Users Seed Script
 * Creates a Public User and a Departmental User for testing.
 * 
 * Usage:
 *   node src/scripts/seedTestUsers.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/user.model");
const District = require("../models/district.model");
const Block = require("../models/block.model");
const DisasterType = require("../models/disasterType.model");
const { ROLES } = require("../constants/roles");
const { DEPARTMENTS } = require("../constants/departments");

const seedTestUsers = async () => {
  try {
    await connectDB();

    // 1. Get Geography Data (Dynamic)
    const district = await District.findOne({ isActive: true });
    if (!district) {
      console.error("❌ No active districts found. Please run seedMasters.js first.");
      process.exit(1);
    }

    const block = await Block.findOne({ district: district._id });
    if (!block) {
      console.error(`❌ No blocks found for district '${district.name}'.`);
      process.exit(1);
    }

    // 2. Get Disaster Types for authorization
    const disasterTypes = await DisasterType.find({});
    const disasterTypeIds = disasterTypes.map(dt => dt._id);

    // 3. Create/Update Public User
    const publicUserData = {
      name: "Test Citizen",
      mobile: "9876543211",
      aadhaar: "111111111111",
      password: "password123",
      role: ROLES.PUBLIC,
      assignedDistrict: district._id,
      assignedBlock: block._id,
      isActive: true,
    };

    let publicUser = await User.findOne({ mobile: publicUserData.mobile });
    if (publicUser) {
      Object.assign(publicUser, publicUserData);
      await publicUser.save();
    } else {
      publicUser = await User.create(publicUserData);
    }
    console.log(`✅ Public User ready: ${publicUser.name} (${publicUser.mobile}) - Region: ${district.name}`);

    // 4. Create/Update Departmental User
    const deptUserData = {
      name: "Test Regional Officer",
      mobile: "9876543222",
      aadhaar: "222222222222",
      password: "password123",
      role: ROLES.DEPARTMENT,
      departmentType: DEPARTMENTS.THANA, // Integrated with our new flow
      assignedDistrict: district._id,
      assignedBlock: block._id,
      authorizedDisasterTypes: disasterTypeIds,
      isActive: true,
    };

    let deptUser = await User.findOne({ mobile: deptUserData.mobile });
    if (deptUser) {
      Object.assign(deptUser, deptUserData);
      await deptUser.save();
    } else {
      deptUser = await User.create(deptUserData);
    }
    console.log(`✅ Departmental User ready: ${deptUser.name} (${deptUser.mobile}) - Region: ${district.name} / ${block.name}`);

    console.log("\n🚀 Test users seeded successfully!\n");
    console.log("-----------------------------------------");
    console.log("PUBLIC USER:");
    console.log(`Mobile:   ${publicUserData.mobile}`);
    console.log(`Aadhaar:  ${publicUserData.aadhaar}`);
    console.log(`Password: ${publicUserData.password}`);
    console.log("-----------------------------------------");
    console.log("REGIONAL OFFICER (Thana):");
    console.log(`Mobile:   ${deptUserData.mobile}`);
    console.log(`Aadhaar:  ${deptUserData.aadhaar}`);
    console.log(`Password: ${deptUserData.password}`);
    console.log(`Region:   ${district.name} / ${block.name}`);
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedTestUsers();

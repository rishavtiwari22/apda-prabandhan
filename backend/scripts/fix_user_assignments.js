const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../src/models/user.model");

const CORRECT_IDS = {
  district: "69f1e36f8b02099445d96f5a",
  tehsil: "69f1e3718b02099445d96f93",
  block: "69f1e3718b02099445d96f96"
};

async function fixUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // 1. Fix Collector (Admin)
    await User.findOneAndUpdate(
      { name: /Collector Jashpur/i },
      { assignedDistrict: CORRECT_IDS.district },
      { new: true }
    );
    console.log("Updated Collector territory.");

    // 2. Fix SDM
    await User.findOneAndUpdate(
      { name: /SDM Jashpur/i },
      { assignedDistrict: CORRECT_IDS.district },
      { new: true }
    );
    console.log("Updated SDM territory.");

    // 3. Fix Tehsildar
    await User.findOneAndUpdate(
      { name: /Tehsildar Jashpur/i },
      { 
        assignedDistrict: CORRECT_IDS.district,
        assignedTehsil: CORRECT_IDS.tehsil,
        assignedBlock: CORRECT_IDS.block
      },
      { new: true }
    );
    console.log("Updated Tehsildar territory.");

    console.log("User assignments fixed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error fixing users:", err);
    process.exit(1);
  }
}

fixUsers();

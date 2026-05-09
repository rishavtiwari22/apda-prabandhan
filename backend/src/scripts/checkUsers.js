const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const User = require("../models/user.model");
const District = require("../models/district.model");
const Block = require("../models/block.model");

const checkUsers = async () => {
  await connectDB();
  const users = await User.find()
    .populate("assignedDistrict", "name")
    .populate("assignedBlock", "name");

  console.log("\n--- User Geography Check ---");
  users.forEach(u => {
    console.log(`${u.role.padEnd(12)} | ${u.name.padEnd(20)} | ${u.mobile} | District: ${u.assignedDistrict?.name || "MISSING"} | Block: ${u.assignedBlock?.name || "MISSING"}`);
  });
  console.log("----------------------------\n");
  process.exit(0);
};

checkUsers();

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const DocumentType = require("../models/documentType.model");
const DisasterType = require("../models/disasterType.model");

const verify = async () => {
  await connectDB();
  const docs = await DocumentType.find().populate("disasterType");
  console.log("Seeded Documents:");
  docs.forEach(d => {
    console.log(`- [${d.disasterType.name}] ${d.name} (${d.responsibleDepartment})`);
  });
  process.exit(0);
};

verify();

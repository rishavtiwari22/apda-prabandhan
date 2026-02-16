require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const DisasterType = require("../models/disasterType.model");
const District = require("../models/district.model");
const Block = require("../models/block.model");
const Panchayat = require("../models/panchayat.model");

const DISASTER_TYPES = [
  {
    name: "Flood",
    nameHindi: "बाढ़",
    description: "Loss due to heavy rainfall and flood",
    requiredDocuments: [
      { label: "Panchnama", labelHindi: "पंचनामा", isMandatory: true },
      { label: "Bank Passbook", labelHindi: "बैंक पासबुक", isMandatory: true },
      { label: "Photo of Loss", labelHindi: "क्षति का फोटो", isMandatory: true },
    ],
  },
  {
    name: "Fire",
    nameHindi: "आग",
    description: "Loss due to accidental fire",
    requiredDocuments: [
      { label: "Fire Brigade Report", labelHindi: "दमकल रिपोर्ट", isMandatory: false },
      { label: "Panchnama", labelHindi: "पंचनामा", isMandatory: true },
    ],
  },
  {
    name: "Lightning",
    nameHindi: "आकाशीय बिजली",
    description: "Loss due to lightning strike",
    requiredDocuments: [
      { label: "Post Mortem Report (if applicable)", labelHindi: "पीएम रिपोर्ट", isMandatory: false },
      { label: "Panchnama", labelHindi: "पंचनामा", isMandatory: true },
    ],
  },
];

const GEOGRAPHY_DATA = {
  district: "Jabalpur",
  blocks: [
    {
      name: "Jabalpur",
      panchayats: ["Panchayat A", "Panchayat B", "Panchayat C"],
    },
    {
      name: "Panagar",
      panchayats: ["Panchayat D", "Panchayat E"],
    },
    {
      name: "Sihora",
      panchayats: ["Panchayat F", "Panchayat G"],
    },
  ],
};

const seedMasters = async () => {
  try {
    await connectDB();

    console.log("🧹 Clearing existing masters...");
    await DisasterType.deleteMany({});
    await District.deleteMany({});
    await Block.deleteMany({});
    await Panchayat.deleteMany({});

    console.log("🌱 Seeding Disaster Types...");
    await DisasterType.insertMany(DISASTER_TYPES);

    console.log("🌱 Seeding Geography...");
    const district = await District.create({ name: GEOGRAPHY_DATA.district });

    for (const blockData of GEOGRAPHY_DATA.blocks) {
      const block = await Block.create({
        name: blockData.name,
        district: district._id,
      });

      const panchayatDocs = blockData.panchayats.map((name) => ({
        name,
        block: block._id,
      }));
      await Panchayat.insertMany(panchayatDocs);
    }

    console.log("\n✅ Master Data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedMasters();

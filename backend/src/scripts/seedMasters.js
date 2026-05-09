require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const DisasterType = require("../models/disasterType.model");
const DocumentType = require("../models/documentType.model");
const District = require("../models/district.model");
const Block = require("../models/block.model");
const Panchayat = require("../models/panchayat.model");
const Vidhansabha = require("../models/vidhansabha.model");
const Application = require("../models/application.model");
const Notification = require("../models/notification.model");
const masterData = require("../data/masterData.json");

const seedMasters = async () => {
  try {
    await connectDB();

    console.log("🧹 Clearing existing data (System Reset)...");
    await Application.deleteMany({});
    await Notification.deleteMany({});
    await DisasterType.deleteMany({});
    await DocumentType.deleteMany({});
    await District.deleteMany({});
    await Block.deleteMany({});
    await Panchayat.deleteMany({});
    await Vidhansabha.deleteMany({});

    console.log("🌱 Seeding Disaster Types & Document Definitions...");
    for (const dt of masterData.disasterTypes) {
      const disaster = await DisasterType.create({
        name: dt.name,
        nameHindi: dt.nameHindi,
        description: dt.description,
        compensationCategory: dt.compensationCategory
      });

      if (dt.documents && dt.documents.length > 0) {
        const docDocs = dt.documents.map(d => ({
          ...d,
          disasterType: disaster._id
        }));
        await DocumentType.insertMany(docDocs);
      }
    }

    console.log("🌱 Seeding Geography Records...");
    for (const distData of masterData.districts) {
      const district = await District.create({ name: distData.name });
      console.log(`  - District: ${distData.name}`);

      // Seed Vidhansabhas
      if (distData.vidhansabhas) {
        const vDocs = distData.vidhansabhas.map(name => ({
          name,
          district: district._id
        }));
        await Vidhansabha.insertMany(vDocs);
        console.log(`    - ${vDocs.length} Vidhansabhas seeded`);
      }

      for (const blockData of distData.blocks) {
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
    }

    console.log("\n✅ Master Data seeded successfully from JSON!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedMasters();

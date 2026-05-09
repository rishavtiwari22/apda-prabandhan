const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars from backend parent dir
dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected to: ${conn.connection.name}`);
    
    // Using native collection access to avoid model loading issues in a script
    const applications = conn.connection.db.collection("applications");
    const count = await applications.countDocuments();
    
    if (count === 0) {
      console.log("ℹ️ Application collection is already empty.");
    } else {
      console.log(`🧹 Deleting ${count} existing application records...`);
      const result = await applications.deleteMany({});
      console.log(`✨ Successfully deleted ${result.deletedCount} applications.`);
    }

    console.log("🚀 Data Reset Complete.");
    process.exit(0);
  } catch (error) {
    console.error(`❌ Data Reset Failed: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

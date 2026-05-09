const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const wipe = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const collections = ['District', 'Tehsil', 'Block', 'Panchayat', 'Village', 'Vidhansabha'];
    
    for (const col of collections) {
      console.log(`Wiping ${col}...`);
      // We use deleteMany({}) instead of drop to keep indexes if possible, 
      // but since we want a "fresh" start, let's just delete everything.
      try {
        const Model = mongoose.model(col) || mongoose.model(col, new mongoose.Schema({}));
        await Model.deleteMany({});
        console.log(`Cleared ${col}.`);
      } catch (e) {
        console.log(`Note: ${col} model not initialized or already empty. Trying direct collection access.`);
        await mongoose.connection.collection(col.toLowerCase() + 's').deleteMany({});
      }
    }

    console.log('Geography data wiped successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Wipe failed:', err);
    process.exit(1);
  }
};

wipe();

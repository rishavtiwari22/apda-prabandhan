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

    const collections = [
      'District', 'Tehsil', 'Block', 'Panchayat', 'Village', 'Vidhansabha',
      'DisasterType', 'DocumentType', 
      'Application', 'DisasterEvent', 'Notification', 'Otp'
    ];
    
    for (const col of collections) {
      console.log(`Wiping ${col}...`);
      try {
        // Access collection directly - MongoDB collections are usually lowercase plurals
        const collectionName = col.toLowerCase() + 's';
        await mongoose.connection.collection(collectionName).deleteMany({});
        console.log(`Cleared ${collectionName}.`);
      } catch (e) {
        console.log(`Error wiping ${col}: ${e.message}`);
      }
    }

    console.log('All requested data wiped successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Wipe failed:', err);
    process.exit(1);
  }
};

wipe();

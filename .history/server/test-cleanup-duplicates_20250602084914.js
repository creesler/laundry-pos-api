const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Inventory = require('./models/Inventory');

async function cleanupDuplicates() {
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/laundry_pos';
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // 2. Find all items with name "yy"
    console.log('\nFinding items with name "yy"...');
    const items = await Inventory.find({ name: "yy" });
    console.log(`Found ${items.length} items with name "yy":`);
    items.forEach(item => {
      console.log({
        _id: item._id.toString(),
        name: item.name,
        currentStock: item.currentStock,
        lastUpdated: item.lastUpdated
      });
    });

    // 3. Delete all these items
    console.log('\nDeleting items...');
    const deleteResult = await Inventory.deleteMany({ name: "yy" });
    console.log('Delete result:', deleteResult);

    // 4. Verify deletion
    console.log('\nVerifying deletion...');
    const remainingItems = await Inventory.find({ name: "yy" });
    console.log(`Remaining items with name "yy": ${remainingItems.length}`);

    // 5. Get all inventory for final check
    console.log('\nCurrent inventory:');
    const allInventory = await Inventory.find({});
    allInventory.forEach(item => {
      console.log({
        _id: item._id.toString(),
        name: item.name,
        currentStock: item.currentStock
      });
    });

    console.log('\nCleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Script failed:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    process.exit(1);
  }
}

cleanupDuplicates(); 
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Inventory = require('./models/Inventory');

async function checkAndDeleteItem() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/laundry_pos';
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // Find the item
    console.log('\nSearching for item named "wan"...');
    const item = await Inventory.findOne({ name: "wan" });

    if (item) {
      console.log('Found item:', {
        _id: item._id.toString(),
        name: item.name,
        currentStock: item.currentStock,
        maxStock: item.maxStock,
        minStock: item.minStock,
        unit: item.unit
      });

      // Delete the item
      console.log('\nDeleting item...');
      await Inventory.findByIdAndDelete(item._id);
      console.log('Item deleted successfully');
    } else {
      console.log('No item found with name "wan"');
    }

    // Verify deletion
    const verifyItem = await Inventory.findOne({ name: "wan" });
    if (!verifyItem) {
      console.log('\nVerified: Item "wan" no longer exists in the database');
    } else {
      console.log('\nWARNING: Item still exists in the database!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndDeleteItem(); 
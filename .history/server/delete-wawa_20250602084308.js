const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Inventory = require('./models/Inventory');

async function deleteWawaItem() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/laundry_pos';
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // Find the wawa item
    console.log('\nSearching for item named "wawa"...');
    const item = await Inventory.findOne({ name: "wawa" });

    if (item) {
      console.log('Found item:', {
        _id: item._id.toString(),
        name: item.name,
        currentStock: item.currentStock,
        maxStock: item.maxStock,
        minStock: item.minStock,
        unit: item.unit
      });

      // Delete using both Mongoose and direct API call to ensure deletion
      console.log('\nDeleting item using Mongoose...');
      await Inventory.findByIdAndDelete(item._id);

      console.log('\nDeleting item using sync API...');
      const syncPayload = {
        inventory: [],
        deletedInventoryIds: [item._id.toString()],
        sales: [],
        timesheet: [],
        inventoryLogs: []
      };

      const response = await axios.post('http://localhost:5000/api/sync', syncPayload);
      console.log('Sync response:', response.data);

      // Verify deletion
      const verifyItem = await Inventory.findOne({ name: "wawa" });
      if (!verifyItem) {
        console.log('\nVerified: Item "wawa" no longer exists in the database');
      } else {
        console.log('\nWARNING: Item still exists in the database!');
        console.log('Current item state:', verifyItem);
      }
    } else {
      console.log('No item found with name "wawa"');
    }

    // Double check using API
    const finalCheck = await axios.get('http://localhost:5000/api/inventory');
    const stillExists = finalCheck.data.some(i => i.name === "wawa");
    if (stillExists) {
      console.log('\nWARNING: Item still found via API!');
      console.log('Current inventory:', finalCheck.data.filter(i => i.name === "wawa"));
    } else {
      console.log('\nAPI verification successful: Item not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    process.exit(1);
  }
}

deleteWawaItem(); 
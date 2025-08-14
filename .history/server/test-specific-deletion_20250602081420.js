const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Inventory = require('./models/Inventory');

async function testSpecificDeletion() {
  try {
    // 1. First connect to MongoDB
    console.log('Connecting to MongoDB...');
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/laundry_pos';
    console.log('Using MongoDB URI:', MONGO_URI);
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // 2. Get current server inventory
    console.log('\nFetching server inventory...');
    const inventoryResponse = await axios.get('http://127.0.0.1:5000/api/inventory');
    const serverInventory = inventoryResponse.data;
    console.log('\nCurrent server inventory:', JSON.stringify(serverInventory, null, 2));

    // 3. Find the "cris" item
    const crisItem = serverInventory.find(item => item.name === "cris");
    if (!crisItem) {
      throw new Error('Item "cris" not found in server inventory');
    }

    console.log('\nFound "cris" item:', {
      _id: crisItem._id,
      name: crisItem.name,
      currentStock: crisItem.currentStock,
      maxStock: crisItem.maxStock,
      minStock: crisItem.minStock,
      unit: crisItem.unit
    });

    // 4. Test deletion using server ID
    console.log('\nTesting deletion...');
    const deletePayload = {
      inventory: [], // Empty inventory
      deletedInventoryIds: [crisItem._id],
      sales: [],
      timesheet: [],
      inventoryLogs: []
    };
    console.log('Sending delete payload:', JSON.stringify(deletePayload, null, 2));

    const deleteResponse = await axios.post('http://127.0.0.1:5000/api/sync', deletePayload);
    console.log('\nDelete response:', JSON.stringify(deleteResponse.data, null, 2));

    // Add delay to ensure delete has propagated
    console.log('\nWaiting for delete to propagate...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 5. Verify item was deleted
    const itemAfterDelete = await Inventory.findById(crisItem._id);
    console.log('\nItem exists after deletion:', itemAfterDelete ? 'Yes (FAILED)' : 'No (SUCCESS)');

    if (itemAfterDelete) {
      console.log('WARNING: Item still exists:', {
        _id: itemAfterDelete._id.toString(),
        name: itemAfterDelete.name
      });
    }

    // 6. Double check server inventory
    const finalInventoryResponse = await axios.get('http://127.0.0.1:5000/api/inventory');
    const finalInventory = finalInventoryResponse.data;
    console.log('\nFinal server inventory:', JSON.stringify(finalInventory, null, 2));

    console.log('\nTest complete!');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    process.exit(1);
  }
}

// Run the test
testSpecificDeletion(); 
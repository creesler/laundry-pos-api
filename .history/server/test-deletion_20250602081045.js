const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Inventory = require('./models/Inventory');

const TEST_ITEM = {
  name: "Test Item " + Date.now(),
  currentStock: 0,
  maxStock: 10,
  minStock: 2,
  unit: "units",
  id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Add local ID
};

async function testInventoryFlow() {
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

    // Drop and recreate the collection
    console.log('\nDropping inventory collection...');
    try {
      await mongoose.connection.db.dropCollection('inventories');
      console.log('Collection dropped successfully');
    } catch (error) {
      if (error.code === 26) {
        console.log('Collection does not exist, continuing...');
      } else {
        throw error;
      }
    }

    // 2. Simulate syncing the local item to server
    console.log('\nSimulating sync to server with local item...');
    const syncPayload = {
      inventory: [TEST_ITEM], // Include our local item
      deletedInventoryIds: [],
      sales: [],
      timesheet: [],
      inventoryLogs: []
    };
    console.log('Sending payload:', JSON.stringify(syncPayload, null, 2));

    const syncResponse = await axios.post('http://127.0.0.1:5000/api/sync', syncPayload);
    console.log('\nSync response:', JSON.stringify(syncResponse.data, null, 2));

    // Add delay to ensure write has propagated
    console.log('\nWaiting for write to propagate...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Get server inventory to get MongoDB ID
    console.log('\nFetching server inventory...');
    const inventoryResponse = await axios.get('http://127.0.0.1:5000/api/inventory');
    const serverInventory = inventoryResponse.data;
    console.log('Server inventory:', JSON.stringify(serverInventory, null, 2));

    const serverItem = serverInventory.find(item => item.name === TEST_ITEM.name);
    if (!serverItem) {
      throw new Error('Test item not found in server inventory');
    }

    console.log('\nFound item in server inventory:', {
      _id: serverItem._id,
      name: serverItem.name,
      currentStock: serverItem.currentStock,
      maxStock: serverItem.maxStock,
      minStock: serverItem.minStock,
      unit: serverItem.unit
    });

    // 4. Test deletion using server ID
    console.log('\nTesting deletion...');
    const deletePayload = {
      inventory: [], // Empty inventory
      deletedInventoryIds: [serverItem._id],
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
    const itemAfterDelete = await Inventory.findById(serverItem._id);
    console.log('\nItem exists after deletion:', itemAfterDelete ? 'Yes (FAILED)' : 'No (SUCCESS)');

    if (itemAfterDelete) {
      console.log('WARNING: Item still exists:', {
        _id: itemAfterDelete._id.toString(),
        name: itemAfterDelete.name
      });

      // Clean up if deletion failed
      console.log('\nCleaning up...');
      const deleteResult = await Inventory.findByIdAndDelete(serverItem._id);
      console.log('Cleanup result:', deleteResult ? 'Success' : 'Failed');
    }

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
testInventoryFlow(); 
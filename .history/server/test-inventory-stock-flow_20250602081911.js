const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Inventory = require('./models/Inventory');

// Simulate IndexedDB data structure
let indexedDBData = {
  inventory: [],
  deletedInventoryIds: []
};

async function testInventoryStockFlow() {
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/laundry_pos';
    console.log('Using MongoDB URI:', MONGO_URI);
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // 2. Simulate adding new item while offline
    console.log('\n=== Step 1: Adding new item "crees" while offline ===');
    const newItem = {
      id: `local-${Date.now()}`,
      name: "crees",
      currentStock: 100,  // Initial stock
      maxStock: 200,
      minStock: 20,
      unit: "pieces"
    };

    // Add to IndexedDB
    indexedDBData.inventory.push(newItem);
    console.log('Item added to IndexedDB:', JSON.stringify(newItem, null, 2));

    // 3. First sync to server
    console.log('\n=== Step 2: First sync to server ===');
    let syncPayload = {
      inventory: indexedDBData.inventory,
      deletedInventoryIds: [],
      sales: [],
      timesheet: [],
      inventoryLogs: []
    };
    
    let syncResponse = await axios.post('http://127.0.0.1:5000/api/sync', syncPayload);
    console.log('First sync response:', JSON.stringify(syncResponse.data, null, 2));

    // 4. Get server inventory to get the real ID
    console.log('\n=== Step 3: Getting server inventory to find real ID ===');
    const serverInventoryResponse = await axios.get('http://127.0.0.1:5000/api/inventory');
    const serverInventory = serverInventoryResponse.data;
    const serverItem = serverInventory.find(item => item.name === "crees");
    
    if (!serverItem) {
      throw new Error('Failed to find "crees" item on server after sync');
    }
    console.log('Server item:', JSON.stringify(serverItem, null, 2));

    // 5. Update stock (simulate using some stock)
    console.log('\n=== Step 4: Updating stock ===');
    const updatedItem = {
      ...serverItem,
      currentStock: 50  // Reduce stock to simulate usage
    };

    // Update in IndexedDB
    indexedDBData.inventory = indexedDBData.inventory.map(item => 
      item.name === "crees" ? updatedItem : item
    );

    // Sync updated stock to server
    syncPayload = {
      inventory: indexedDBData.inventory,
      deletedInventoryIds: [],
      sales: [],
      timesheet: [],
      inventoryLogs: []
    };
    
    syncResponse = await axios.post('http://127.0.0.1:5000/api/sync', syncPayload);
    console.log('Stock update sync response:', JSON.stringify(syncResponse.data, null, 2));

    // 6. Delete the item
    console.log('\n=== Step 5: Deleting the item ===');
    indexedDBData.deletedInventoryIds.push(serverItem._id);
    indexedDBData.inventory = indexedDBData.inventory.filter(item => item.name !== "crees");

    // Final sync to delete from server
    syncPayload = {
      inventory: indexedDBData.inventory,
      deletedInventoryIds: indexedDBData.deletedInventoryIds,
      sales: [],
      timesheet: [],
      inventoryLogs: []
    };
    
    syncResponse = await axios.post('http://127.0.0.1:5000/api/sync', syncPayload);
    console.log('Deletion sync response:', JSON.stringify(syncResponse.data, null, 2));

    // 7. Verify final state
    console.log('\n=== Step 6: Verifying final state ===');
    
    // Add delay to ensure changes have propagated
    await new Promise(resolve => setTimeout(resolve, 1000));

    const finalInventoryResponse = await axios.get('http://127.0.0.1:5000/api/inventory');
    const finalInventory = finalInventoryResponse.data;
    
    const itemStillExists = finalInventory.some(item => item.name === "crees");
    
    if (!itemStillExists) {
      console.log('\nTest PASSED: Item "crees" was successfully deleted');
    } else {
      console.log('\nTest FAILED: Item "crees" still exists in the database');
      console.log('Final inventory state:', JSON.stringify(finalInventory, null, 2));
      throw new Error('Final state verification failed');
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
testInventoryStockFlow(); 
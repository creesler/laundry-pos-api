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

async function simulateUserFlow() {
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

    // 2. Simulate user adding items while offline
    console.log('\n=== User is offline and adds new items ===');
    const offlineItems = [
      {
        id: `local-${Date.now()}-1`,
        name: "Test Soap",
        currentStock: 0,
        maxStock: 50,
        minStock: 10,
        unit: "bottles"
      },
      {
        id: `local-${Date.now()}-2`,
        name: "Test Detergent",
        currentStock: 0,
        maxStock: 30,
        minStock: 5,
        unit: "boxes"
      }
    ];

    // Add items to "IndexedDB"
    indexedDBData.inventory.push(...offlineItems);
    console.log('Items added to IndexedDB:', JSON.stringify(offlineItems, null, 2));

    // 3. Simulate user deleting first item while still offline
    console.log('\n=== User deletes first item while offline ===');
    const itemToDelete = offlineItems[0];
    indexedDBData.deletedInventoryIds.push(itemToDelete.id);
    indexedDBData.inventory = indexedDBData.inventory.filter(item => item.id !== itemToDelete.id);
    console.log('Item marked for deletion:', itemToDelete.name);
    console.log('Updated IndexedDB data:', JSON.stringify(indexedDBData, null, 2));

    // 4. Simulate user going online and syncing
    console.log('\n=== User goes online and syncs ===');
    
    // First get server inventory to map IDs
    console.log('\nFetching current server inventory...');
    const serverInventoryResponse = await axios.get('http://127.0.0.1:5000/api/inventory');
    const serverInventory = serverInventoryResponse.data;
    console.log('Current server inventory:', JSON.stringify(serverInventory, null, 2));

    // Map local IDs to server IDs for deletion
    const serverIdsToDelete = indexedDBData.deletedInventoryIds
      .map(localId => {
        if (!localId.startsWith('local-')) return localId;
        
        const localItem = indexedDBData.inventory.find(item => item.id === localId);
        if (!localItem) return null;
        
        const serverItem = serverInventory.find(item => item.name === localItem.name);
        return serverItem ? serverItem._id : null;
      })
      .filter(Boolean);

    // Prepare sync payload
    const syncPayload = {
      inventory: indexedDBData.inventory,
      deletedInventoryIds: serverIdsToDelete,
      sales: [],
      timesheet: [],
      inventoryLogs: []
    };
    console.log('\nSending sync payload:', JSON.stringify(syncPayload, null, 2));

    // Send sync request
    const syncResponse = await axios.post('http://127.0.0.1:5000/api/sync', syncPayload);
    console.log('\nSync response:', JSON.stringify(syncResponse.data, null, 2));

    // 5. Verify final state
    console.log('\n=== Verifying final state ===');
    
    // Add delay to ensure changes have propagated
    await new Promise(resolve => setTimeout(resolve, 1000));

    const finalInventoryResponse = await axios.get('http://127.0.0.1:5000/api/inventory');
    const finalInventory = finalInventoryResponse.data;
    console.log('\nFinal server inventory:', JSON.stringify(finalInventory, null, 2));

    // Verify only second item exists
    const expectedItem = finalInventory.find(item => item.name === offlineItems[1].name);
    const deletedItem = finalInventory.find(item => item.name === offlineItems[0].name);

    if (expectedItem && !deletedItem) {
      console.log('\nTest PASSED:');
      console.log('- Second item exists:', expectedItem.name);
      console.log('- First item was deleted successfully');
    } else {
      console.log('\nTest FAILED:');
      if (!expectedItem) console.log('- Second item not found');
      if (deletedItem) console.log('- First item still exists');
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
simulateUserFlow(); 
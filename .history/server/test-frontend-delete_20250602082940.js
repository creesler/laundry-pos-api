const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Inventory = require('./models/Inventory');

async function testFrontendDelete() {
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/laundry_pos';
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // 2. Create a test item (simulating frontend add)
    console.log('\n=== Step 1: Adding new test item ===');
    const newItem = {
      id: `local-${Date.now()}`,
      name: "TestItem",
      currentStock: 50,
      maxStock: 100,
      minStock: 10,
      unit: "pieces"
    };

    // 3. First sync to create the item
    console.log('\n=== Step 2: First sync to create item ===');
    let syncPayload = {
      inventory: [newItem],
      deletedInventoryIds: [],
      sales: [],
      timesheet: [],
      inventoryLogs: []
    };

    let response = await axios.post('http://localhost:5000/api/sync', syncPayload);
    console.log('Create sync response:', response.data);

    // 4. Get the server's inventory to find the real MongoDB ID
    console.log('\n=== Step 3: Getting server inventory to find real ID ===');
    const serverInventoryResponse = await axios.get('http://localhost:5000/api/inventory');
    const serverItem = serverInventoryResponse.data.find(item => item.name === "TestItem");
    
    if (!serverItem) {
      throw new Error('Failed to find test item on server after creation');
    }
    console.log('Server item:', serverItem);

    // 5. Now delete the item (simulating frontend delete)
    console.log('\n=== Step 4: Deleting the item ===');
    syncPayload = {
      inventory: [],
      deletedInventoryIds: [serverItem._id],
      sales: [],
      timesheet: [],
      inventoryLogs: []
    };

    response = await axios.post('http://localhost:5000/api/sync', syncPayload);
    console.log('Delete sync response:', response.data);

    // 6. Verify the item is deleted
    console.log('\n=== Step 5: Verifying deletion ===');
    const finalInventoryResponse = await axios.get('http://localhost:5000/api/inventory');
    const itemStillExists = finalInventoryResponse.data.some(item => item._id === serverItem._id);

    if (!itemStillExists) {
      console.log('\nTest PASSED: Item was successfully deleted');
    } else {
      console.log('\nTest FAILED: Item still exists in the database');
      console.log('Current inventory:', finalInventoryResponse.data);
    }

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

testFrontendDelete(); 
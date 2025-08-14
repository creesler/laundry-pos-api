const axios = require('axios');
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

const TEST_ITEM = {
  name: "Test Item " + Date.now(), // Unique name to avoid conflicts
  currentStock: 5,
  maxStock: 10,
  minStock: 2,
  unit: "units"
};

async function testDeletion() {
  try {
    // 1. First connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/laundry_pos', {
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

    // 2. Create a test item via API
    console.log('\nCreating test item via API...');
    const createResponse = await axios.post('http://localhost:5000/api/inventory', TEST_ITEM);
    const createdItem = createResponse.data;
    console.log('Created test item:', createdItem);
    console.log('Item ID:', createdItem._id);

    // 3. Verify item exists in database
    const foundItem = await Inventory.findById(createdItem._id);
    console.log('\nVerified item exists:', foundItem ? 'Yes' : 'No');
    if (foundItem) {
      console.log('Found item details:', {
        _id: foundItem._id.toString(),
        name: foundItem.name
      });
    }

    // 4. Attempt to delete via sync endpoint
    console.log('\nAttempting to delete via sync endpoint...');
    const syncPayload = {
      inventory: [], // Empty inventory since item is "deleted" from frontend
      deletedInventoryIds: [createdItem._id],
      sales: [],
      timesheet: [],
      inventoryLogs: []
    };
    console.log('Sending payload:', JSON.stringify(syncPayload, null, 2));

    const syncResponse = await axios.post('http://localhost:5000/api/sync', syncPayload);
    console.log('\nSync response:', JSON.stringify(syncResponse.data, null, 2));

    // 5. Verify item was deleted
    const itemAfterDelete = await Inventory.findById(createdItem._id);
    console.log('\nItem exists after deletion:', itemAfterDelete ? 'Yes (FAILED)' : 'No (SUCCESS)');
    if (itemAfterDelete) {
      console.log('Item that should have been deleted:', {
        _id: itemAfterDelete._id.toString(),
        name: itemAfterDelete.name
      });

      // 6. Clean up if deletion failed
      console.log('\nCleaning up...');
      const deleteResult = await Inventory.findByIdAndDelete(createdItem._id);
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
testDeletion(); 
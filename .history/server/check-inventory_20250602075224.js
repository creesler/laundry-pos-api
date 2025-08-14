const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

async function checkInventory() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/laundry_pos', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // Get all inventory items
    console.log('\nFetching all inventory items...');
    const items = await Inventory.find({});
    
    if (items.length === 0) {
      console.log('No items found in inventory collection');
    } else {
      console.log('Found', items.length, 'items:');
      items.forEach(item => {
        console.log('\nItem:', {
          _id: item._id.toString(),
          name: item.name,
          currentStock: item.currentStock,
          maxStock: item.maxStock,
          minStock: item.minStock,
          unit: item.unit,
          lastUpdated: item.lastUpdated
        });
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the check
checkInventory(); 
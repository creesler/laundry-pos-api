import mongoose from 'mongoose';
import Inventory from './models/Inventory.js';
import { connectDB } from './config/db.js';

const testInventoryItems = [
  {
    name: 'Soap',
    currentStock: 50,
    maxStock: 100,
    minStock: 20,
    unit: 'boxes'
  },
  {
    name: 'Detergent',
    currentStock: 75,
    maxStock: 150,
    minStock: 30,
    unit: 'bottles'
  },
  {
    name: 'Fabric Softener',
    currentStock: 25,
    maxStock: 80,
    minStock: 15,
    unit: 'bottles'
  },
  {
    name: 'Bleach',
    currentStock: 40,
    maxStock: 90,
    minStock: 20,
    unit: 'bottles'
  }
];

async function initTestData() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Clear existing inventory
    await Inventory.deleteMany({});
    console.log('Cleared existing inventory');

    // Insert test items
    const result = await Inventory.insertMany(testInventoryItems);
    console.log('Added test inventory items:', result);

    console.log('Test data initialization complete');
  } catch (error) {
    console.error('Error initializing test data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initTestData(); 
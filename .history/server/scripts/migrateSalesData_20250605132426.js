const mongoose = require('mongoose');
const Sale = require('../models/Sale');

// Helper function to parse numeric value
const parseNumericValue = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

async function migrateSalesData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/laundry', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get all sales
    const sales = await Sale.find({});
    console.log(`Found ${sales.length} sales records to migrate`);

    // Update each sale
    let updated = 0;
    for (const sale of sales) {
      const updates = {
        Coin: parseNumericValue(sale.Coin),
        Hopper: parseNumericValue(sale.Hopper),
        Soap: parseNumericValue(sale.Soap),
        Vending: parseNumericValue(sale.Vending),
        'Drop Off Amount 1': parseNumericValue(sale['Drop Off Amount 1']),
        'Drop Off Amount 2': parseNumericValue(sale['Drop Off Amount 2'])
      };

      await Sale.findByIdAndUpdate(sale._id, updates);
      updated++;

      if (updated % 100 === 0) {
        console.log(`Migrated ${updated} records...`);
      }
    }

    console.log(`Successfully migrated ${updated} sales records`);
    process.exit(0);
  } catch (err) {
    console.error('Error during migration:', err);
    process.exit(1);
  }
}

migrateSalesData(); 
const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Timesheet = require('../models/Timesheet');
const Inventory = require('../models/Inventory');

// @route   POST /api/sync
// @desc    Receive and save sales, timesheet, and inventory data from frontend
// @access  Public (you might add auth later)
router.post('/', async (req, res) => {
  const { sales, timesheet, inventory, inventoryLogs } = req.body;

  try {
    const savedSales = [];
    const savedTimesheets = [];
    const savedInventory = [];
    const savedLogs = [];

    // Save new sales records
    if (sales && sales.length > 0) {
      const salesToSave = sales.map(sale => new Sale(sale));
      const insertSalesResult = await Sale.insertMany(salesToSave, { ordered: false });
      savedSales.push(...insertSalesResult);
    }

    // Save new timesheet records
    if (timesheet && timesheet.length > 0) {
      const timesheetsToSave = timesheet.map(entry => new Timesheet(entry));
      const insertTimesheetsResult = await Timesheet.insertMany(timesheetsToSave, { ordered: false });
      savedTimesheets.push(...insertTimesheetsResult);
    }

    // Save inventory updates
    if (inventory && inventory.length > 0) {
      for (const item of inventory) {
        const { id, name, currentStock, maxStock, minStock, unit } = item;
        const updatedItem = await Inventory.findOneAndUpdate(
          { itemName: name },
          {
            currentStock,
            maxStock,
            minStock,
            unit,
            updatedAt: new Date()
          },
          { new: true, upsert: true }
        );
        savedInventory.push(updatedItem);
      }
    }

    // Save inventory logs if provided
    if (inventoryLogs && inventoryLogs.length > 0) {
      // You might want to create a separate model for inventory logs
      // For now, we'll just acknowledge receipt
      savedLogs.push(...inventoryLogs);
    }

    res.json({ 
      message: 'Sync successful', 
      savedSalesCount: savedSales.length, 
      savedTimesheetsCount: savedTimesheets.length,
      savedInventoryCount: savedInventory.length,
      savedLogsCount: savedLogs.length
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      message: 'Server Error during sync',
      error: err.message
    });
  }
});

// TODO: Add a GET route to fetch data for the admin page (e.g., /api/sync/data?startDate=...&endDate=...)

module.exports = router; 
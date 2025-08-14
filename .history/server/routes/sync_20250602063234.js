const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Timesheet = require('../models/Timesheet');
const Inventory = require('../models/Inventory');
const InventoryLog = require('../models/InventoryLog');

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
      try {
        const salesToSave = sales.map(sale => new Sale({
          Date: sale.Date,
          Coin: sale.Coin,
          Hopper: sale.Hopper,
          Soap: sale.Soap,
          Vending: sale.Vending,
          'Drop Off Amount 1': sale['Drop Off Amount 1'],
          'Drop Off Code': sale['Drop Off Code'],
          'Drop Off Amount 2': sale['Drop Off Amount 2']
        }));
        const insertSalesResult = await Sale.insertMany(salesToSave, { ordered: false });
        savedSales.push(...insertSalesResult);
      } catch (error) {
        console.error('Error saving sales:', error);
      }
    }

    // Save new timesheet records
    if (timesheet && timesheet.length > 0) {
      try {
        const timesheetsToSave = timesheet.map(entry => new Timesheet({
          employeeName: entry.employeeName,
          date: entry.date,
          time: entry.time,
          action: entry.action
        }));
        const insertTimesheetsResult = await Timesheet.insertMany(timesheetsToSave, { ordered: false });
        savedTimesheets.push(...insertTimesheetsResult);
      } catch (error) {
        console.error('Error saving timesheets:', error);
      }
    }

    // Save inventory updates
    if (inventory && inventory.length > 0) {
      try {
        for (const item of inventory) {
          const { name, currentStock, maxStock, minStock, unit } = item;
          const updatedItem = await Inventory.findOneAndUpdate(
            { name }, // Use name field directly
            { 
              $set: { 
                currentStock,
                maxStock,
                minStock,
                unit,
                updatedAt: new Date()
              }
            },
            { new: true, upsert: true }
          );
          savedInventory.push(updatedItem);
        }
      } catch (error) {
        console.error('Error saving inventory:', error);
      }
    }

    // Save inventory logs
    if (inventoryLogs && inventoryLogs.length > 0) {
      try {
        const logsToSave = inventoryLogs.map(log => new InventoryLog({
          itemId: log.itemId,
          previousStock: log.previousStock,
          newStock: log.newStock,
          updateType: log.updateType,
          timestamp: new Date(log.timestamp),
          updatedBy: log.updatedBy,
          notes: log.notes
        }));
        const insertLogsResult = await InventoryLog.insertMany(logsToSave, { ordered: false });
        savedLogs.push(...insertLogsResult);
      } catch (error) {
        console.error('Error saving inventory logs:', error);
      }
    }

    // Send response with counts
    res.json({ 
      message: 'Sync successful', 
      savedSalesCount: savedSales.length, 
      savedTimesheetsCount: savedTimesheets.length,
      savedInventoryCount: savedInventory.length,
      savedLogsCount: savedLogs.length
    });

  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({
      message: 'Server Error during sync',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// TODO: Add a GET route to fetch data for the admin page (e.g., /api/sync/data?startDate=...&endDate=...)

module.exports = router; 
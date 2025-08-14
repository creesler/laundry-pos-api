const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Timesheet = require('../models/Timesheet');
const Inventory = require('../models/Inventory');
const InventoryLog = require('../models/InventoryLog');
const mongoose = require('mongoose');

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
    const errors = [];

    // Save new sales records
    if (sales && sales.length > 0) {
      try {
        const salesToSave = sales.map(sale => ({
          Date: sale.Date,
          Coin: sale.Coin,
          Hopper: sale.Hopper,
          Soap: sale.Soap,
          Vending: sale.Vending,
          'Drop Off Amount 1': sale['Drop Off Amount 1'],
          'Drop Off Code': sale['Drop Off Code'],
          'Drop Off Amount 2': sale['Drop Off Amount 2']
        }));
        console.log('Attempting to save sales:', JSON.stringify(salesToSave, null, 2));
        const insertSalesResult = await Sale.insertMany(salesToSave, { ordered: false });
        savedSales.push(...insertSalesResult);
      } catch (error) {
        console.error('Error saving sales:', error);
        errors.push({ type: 'sales', error: error.message });
      }
    }

    // Save new timesheet records
    if (timesheet && timesheet.length > 0) {
      try {
        const timesheetsToSave = timesheet.map(entry => ({
          employeeName: entry.employeeName,
          date: entry.date,
          time: entry.time,
          action: entry.action
        }));
        const insertTimesheetsResult = await Timesheet.insertMany(timesheetsToSave, { ordered: false });
        savedTimesheets.push(...insertTimesheetsResult);
      } catch (error) {
        console.error('Error saving timesheets:', error);
        errors.push({ type: 'timesheet', error: error.message });
      }
    }

    // Save inventory updates
    if (inventory && inventory.length > 0) {
      try {
        for (const item of inventory) {
          const { name, currentStock, maxStock, minStock, unit } = item;
          console.log('Attempting to save inventory item:', { name, currentStock, maxStock, minStock, unit });
          const updatedItem = await Inventory.findOneAndUpdate(
            { name },
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
          if (updatedItem) {
            savedInventory.push(updatedItem);
          } else {
            console.error('Failed to save inventory item:', name);
            errors.push({ type: 'inventory', error: `Failed to save item: ${name}` });
          }
        }
      } catch (error) {
        console.error('Error saving inventory:', error);
        errors.push({ type: 'inventory', error: error.message });
      }
    }

    // Save inventory logs
    if (inventoryLogs && inventoryLogs.length > 0) {
      try {
        // First, get all inventory items to map names to IDs
        const allInventoryItems = await Inventory.find({});
        const nameToIdMap = new Map(allInventoryItems.map(item => [item.name, item._id]));

        const logsToSave = [];
        for (const log of inventoryLogs) {
          // Find the corresponding inventory item
          const inventoryItem = await Inventory.findOne({ name: log.itemId });
          if (!inventoryItem) {
            console.error('Inventory item not found for log:', log.itemId);
            errors.push({ type: 'inventoryLog', error: `Inventory item not found: ${log.itemId}` });
            continue;
          }

          logsToSave.push({
            itemId: inventoryItem._id, // Use the actual MongoDB ObjectId
            previousStock: log.previousStock,
            newStock: log.newStock,
            updateType: log.updateType,
            timestamp: new Date(log.timestamp),
            updatedBy: log.updatedBy,
            notes: log.notes
          });
        }

        if (logsToSave.length > 0) {
          console.log('Attempting to save inventory logs:', JSON.stringify(logsToSave, null, 2));
          const insertLogsResult = await InventoryLog.insertMany(logsToSave, { ordered: false });
          savedLogs.push(...insertLogsResult);
        }
      } catch (error) {
        console.error('Error saving inventory logs:', error);
        errors.push({ type: 'inventoryLog', error: error.message });
      }
    }

    // Send response with counts and any errors
    res.json({ 
      message: errors.length > 0 ? 'Sync completed with some errors' : 'Sync successful',
      savedSalesCount: savedSales.length, 
      savedTimesheetsCount: savedTimesheets.length,
      savedInventoryCount: savedInventory.length,
      savedLogsCount: savedLogs.length,
      errors: errors.length > 0 ? errors : undefined
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
const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Timesheet = require('../models/Timesheet');
const Inventory = require('../models/Inventory');
const InventoryLog = require('../models/InventoryLog');
const mongoose = require('mongoose');

// @route   GET /api/sync
// @desc    Get all data (sales, timesheets, inventory)
// @access  Public (for now)
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/sync - Fetching all data...');
    
    // Get all data from each collection
    console.log('Fetching timesheets...');
    const timesheets = await Timesheet.find().sort({ date: -1 });
    console.log(`Found ${timesheets.length} timesheet entries`);

    console.log('Fetching sales...');
    const sales = await Sale.find().sort({ date: -1 });
    console.log(`Found ${sales.length} sales entries`);

    console.log('Fetching inventory...');
    const inventory = await Inventory.find().sort({ name: 1 });
    console.log(`Found ${inventory.length} inventory items`);

    console.log('Fetching inventory logs...');
    const inventoryLogs = await InventoryLog.find().sort({ timestamp: -1 });
    console.log(`Found ${inventoryLogs.length} inventory logs`);

    const response = {
      sales,
      timesheet: timesheets,
      inventory,
      inventoryLogs
    };

    console.log('Sending response with data counts:', {
      salesCount: sales.length,
      timesheetCount: timesheets.length,
      inventoryCount: inventory.length,
      inventoryLogsCount: inventoryLogs.length
    });

    res.json(response);
  } catch (err) {
    console.error('Error fetching sync data:', err);
    res.status(500).json({
      message: 'Server Error during sync data fetch',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

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
        console.log('Attempting to save sales:', JSON.stringify(sales, null, 2));
        const insertSalesResult = await Sale.insertMany(sales, { ordered: false });
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
          console.log('Processing inventory item:', item);
          try {
            if (item.isDeleted) {
              // Delete the item if marked for deletion
              const deletedItem = await Inventory.findOneAndDelete({ name: item.name });
              if (deletedItem) {
                console.log('Deleted inventory item:', item.name);
                savedInventory.push({ ...deletedItem.toObject(), isDeleted: true });
              }
            } else {
              // Update or create item
              const updatedItem = await Inventory.findOneAndUpdate(
                { name: item.name },
                { 
                  $set: { 
                    currentStock: item.currentStock,
                    maxStock: item.maxStock,
                    minStock: item.minStock,
                    unit: item.unit,
                    lastUpdated: new Date()
                  }
                },
                { new: true, upsert: true }
              );
              console.log('Updated/Created inventory item:', updatedItem);
              savedInventory.push(updatedItem);
            }
          } catch (itemError) {
            console.error('Error processing inventory item:', item.name, itemError);
            errors.push({ type: 'inventory', error: `Failed to save item ${item.name}: ${itemError.message}` });
          }
        }
      } catch (error) {
        console.error('Error in inventory batch processing:', error);
        errors.push({ type: 'inventory', error: error.message });
      }
    }

    // Save inventory logs
    if (inventoryLogs && inventoryLogs.length > 0) {
      try {
        for (const log of inventoryLogs) {
          try {
            // Create the log using the item name directly
            const newLog = new InventoryLog({
              itemId: log.itemId, // Using the name directly as itemId
              previousStock: log.previousStock,
              newStock: log.newStock,
              updateType: log.updateType,
              timestamp: new Date(log.timestamp),
              updatedBy: log.updatedBy,
              notes: log.notes
            });

            const savedLog = await newLog.save();
            console.log('Saved inventory log:', savedLog);
            savedLogs.push(savedLog);
          } catch (logError) {
            console.error('Error saving individual log:', logError);
            errors.push({ type: 'inventoryLog', error: `Failed to save log: ${logError.message}` });
          }
        }
      } catch (error) {
        console.error('Error in inventory logs batch processing:', error);
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
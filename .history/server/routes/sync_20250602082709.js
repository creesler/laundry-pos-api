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
  const { sales, timesheet, inventory, inventoryLogs, deletedInventoryIds } = req.body;

  console.log('Received sync request with data:', {
    salesCount: sales?.length || 0,
    timesheetCount: timesheet?.length || 0,
    inventoryCount: inventory?.length || 0,
    inventoryLogsCount: inventoryLogs?.length || 0,
    deletedInventoryIds
  });

  try {
    const savedSales = [];
    const savedTimesheets = [];
    const savedInventory = [];
    const savedLogs = [];
    const deletedItems = [];
    const errors = [];

    // Handle deleted inventory items first
    if (deletedInventoryIds && deletedInventoryIds.length > 0) {
      try {
        console.log('\n=== Starting Deletion Process ===');
        console.log('Received IDs for deletion:', deletedInventoryIds);
        
        for (const id of deletedInventoryIds) {
          try {
            console.log('\nProcessing deletion ID:', id);
            
            // Ensure the ID is a valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
              console.log('Invalid ObjectId:', id);
              continue;
            }

            // Try to delete the item
            const deletedItem = await Inventory.findByIdAndDelete(id);
            
            if (deletedItem) {
              console.log('Successfully deleted item:', {
                _id: deletedItem._id.toString(),
                name: deletedItem.name
              });
              deletedItems.push(deletedItem);
            } else {
              console.log('No item found with ID:', id);
              errors.push({ 
                type: 'inventory_delete', 
                error: `Item not found: ${id}` 
              });
            }
          } catch (error) {
            console.error('Error deleting item:', id, error);
            errors.push({ 
              type: 'inventory_delete', 
              error: `Failed to delete ${id}: ${error.message}` 
            });
          }
        }

        console.log('\n=== Deletion Process Complete ===');
        console.log('Successfully deleted items:', deletedItems.length);
      } catch (error) {
        console.error('Error in deletion batch processing:', error);
        errors.push({ type: 'inventory_delete', error: error.message });
      }
    }

    // Filter out deleted items and items with invalid IDs from inventory before saving
    const inventoryToUpdate = inventory ? inventory.filter(item => {
      if (!item) return false;
      if (item.id && item.id.startsWith('local-')) return true;
      return mongoose.Types.ObjectId.isValid(item.id);
    }) : [];

    // Save inventory updates
    if (inventoryToUpdate && inventoryToUpdate.length > 0) {
      try {
        console.log('\n=== Starting Inventory Processing ===');
        console.log('Items to process:', inventoryToUpdate.length);
        
        for (const item of inventoryToUpdate) {
          try {
            console.log('\nProcessing inventory item:', {
              id: item.id,
              name: item.name,
              isLocal: item.id?.startsWith('local-')
            });

            // Check if this is a new item (has a local- prefix in ID)
            if (item.id && item.id.startsWith('local-')) {
              // Create new item without the local ID
              const { id, ...itemData } = item;
              const newItem = new Inventory(itemData);
              const savedItem = await newItem.save();
              console.log('Created new inventory item:', savedItem);
              savedInventory.push(savedItem);
            } else if (mongoose.Types.ObjectId.isValid(item.id)) {
              // Update existing item
              const { id, ...updateData } = item;
              const updatedItem = await Inventory.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true }
              );
              
              if (updatedItem) {
                console.log('Updated inventory item:', updatedItem);
                savedInventory.push(updatedItem);
              } else {
                console.log('Item not found for update:', id);
                errors.push({ type: 'inventory', error: `Item not found: ${id}` });
              }
            }
          } catch (itemError) {
            console.error('Error processing inventory item:', {
              name: item.name,
              error: itemError.message
            });
            errors.push({ type: 'inventory', error: `Failed to save item ${item.name}: ${itemError.message}` });
          }
        }
        
        console.log('\n=== Inventory Processing Complete ===');
        console.log('Successfully processed items:', savedInventory.length);
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
            const newLog = new InventoryLog({
              itemId: log.itemId,
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

    // Save new sales records
    if (sales && sales.length > 0) {
      try {
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

    // Send response with counts and any errors
    res.json({ 
      message: errors.length > 0 ? 'Sync completed with some errors' : 'Sync successful',
      savedSalesCount: savedSales.length, 
      savedTimesheetsCount: savedTimesheets.length,
      savedInventoryCount: savedInventory.length,
      savedLogsCount: savedLogs.length,
      deletedItemsCount: deletedItems.length,
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
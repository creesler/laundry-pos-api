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
  console.log('Received sync request with data:', {
    salesCount: req.body.sales?.length || 0,
    timesheetCount: req.body.timesheet?.length || 0,
    inventoryCount: req.body.inventory?.length || 0,
    inventoryLogsCount: req.body.inventoryLogs?.length || 0,
    deletedInventoryIds: req.body.deletedInventoryIds || []
  });

  const { sales, timesheet, inventory, inventoryLogs, deletedInventoryIds } = req.body;

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
            console.log('\nProcessing ID:', id);
            
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

        // Verify all items were deleted
        const remainingIds = deletedItems.map(item => item._id);
        const remainingItems = await Inventory.find({
          _id: { $in: remainingIds }
        });
        
        if (remainingItems.length > 0) {
          console.error('Some items were not deleted:', remainingItems);
          errors.push({ 
            type: 'inventory_delete', 
            error: `Failed to delete ${remainingItems.length} items` 
          });
        }

        console.log('\n=== Deletion Process Complete ===');
        console.log('Successfully deleted items:', deletedItems.length);
        console.log('Errors:', errors.length);
      } catch (error) {
        console.error('Error in deletion batch processing:', error);
        errors.push({ type: 'inventory_delete', error: error.message });
      }
    }

    // Filter out deleted items from inventory before saving
    const inventoryToUpdate = inventory.filter(item => !deletedInventoryIds.includes(item.id));

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
    if (inventoryToUpdate && inventoryToUpdate.length > 0) {
      try {
        console.log('\n=== Starting Inventory Processing ===');
        console.log('Items to process:', inventoryToUpdate.length);
        
        for (const item of inventoryToUpdate) {
          console.log('\nProcessing inventory item:', {
            id: item.id,
            name: item.name,
            isLocal: item.id?.startsWith('local-')
          });
          
          try {
            // Check if this is a new item (has a local- prefix in ID)
            if (item.id && item.id.startsWith('local-')) {
              // Create new item without the local ID
              const { id, ...itemData } = item;
              console.log('Creating new inventory item with data:', itemData);
              
              const newItem = new Inventory(itemData);
              console.log('Created Inventory model instance:', newItem);
              
              const savedItem = await newItem.save();
              console.log('Saved new inventory item:', {
                _id: savedItem._id.toString(),
                name: savedItem.name,
                currentStock: savedItem.currentStock,
                maxStock: savedItem.maxStock,
                minStock: savedItem.minStock,
                unit: savedItem.unit
              });
              
              savedInventory.push(savedItem);
            } else {
              // Update existing item
              console.log('Updating existing item with ID:', item.id);
              const updatedItem = await Inventory.findByIdAndUpdate(
                item.id,
                { 
                  $set: { 
                    name: item.name,
                    currentStock: item.currentStock,
                    maxStock: item.maxStock,
                    minStock: item.minStock,
                    unit: item.unit,
                    lastUpdated: new Date()
                  }
                },
                { new: true, upsert: false }
              );
              if (updatedItem) {
                console.log('Updated inventory item:', {
                  _id: updatedItem._id.toString(),
                  name: updatedItem.name,
                  currentStock: updatedItem.currentStock,
                  maxStock: updatedItem.maxStock,
                  minStock: updatedItem.minStock,
                  unit: updatedItem.unit
                });
                savedInventory.push(updatedItem);
              } else {
                console.log('Item not found for update:', item.id);
                errors.push({ type: 'inventory', error: `Item not found: ${item.id}` });
              }
            }
          } catch (itemError) {
            console.error('Error processing inventory item:', {
              name: item.name,
              error: itemError.message,
              stack: itemError.stack
            });
            errors.push({ type: 'inventory', error: `Failed to save item ${item.name}: ${itemError.message}` });
          }
        }
        
        console.log('\n=== Inventory Processing Complete ===');
        console.log('Successfully processed items:', savedInventory.length);
        console.log('Errors:', errors.length);
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
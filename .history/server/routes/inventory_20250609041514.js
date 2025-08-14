import express from 'express';
import Inventory from '../models/Inventory.js';

const router = express.Router();

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Public (for now)
router.get('/', async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .select('-__v')
      .sort({ name: 1 });
    res.json(inventory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/inventory/:id
// @desc    Get inventory item by ID
// @access  Public (for now)
router.get('/:id', async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id).select('-__v');
    if (!item) {
      return res.status(404).json({ msg: 'Inventory item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Inventory item not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/inventory
// @desc    Create a new inventory item
// @access  Public (for now)
router.post('/', async (req, res) => {
  try {
    const { name, currentStock, maxStock, minStock, unit } = req.body;

    // Validate required fields
    if (!name || currentStock === undefined || maxStock === undefined || minStock === undefined) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // Check if item already exists
    let item = await Inventory.findOne({ name });
    if (item) {
      return res.status(400).json({ msg: 'Item already exists' });
    }

    // Validate stock values
    if (currentStock < 0 || maxStock < 0 || minStock < 0) {
      return res.status(400).json({ msg: 'Stock values cannot be negative' });
    }

    if (minStock > maxStock) {
      return res.status(400).json({ msg: 'Minimum stock cannot be greater than maximum stock' });
    }

    if (currentStock > maxStock) {
      return res.status(400).json({ msg: 'Current stock cannot be greater than maximum stock' });
    }

    // Create new item
    item = new Inventory({
      name,
      currentStock,
      maxStock,
      minStock,
      unit: unit || 'units',
      lastUpdated: new Date()
    });

    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update an inventory item
// @access  Public (for now)
router.put('/:id', async (req, res) => {
  try {
    const { currentStock, maxStock, minStock, unit } = req.body;

    // Build inventory object
    const inventoryFields = {};
    if (currentStock !== undefined) {
      if (currentStock < 0) {
        return res.status(400).json({ msg: 'Stock cannot be negative' });
      }
      inventoryFields.currentStock = currentStock;
    }
    if (maxStock !== undefined) {
      if (maxStock < 0) {
        return res.status(400).json({ msg: 'Maximum stock cannot be negative' });
      }
      inventoryFields.maxStock = maxStock;
    }
    if (minStock !== undefined) {
      if (minStock < 0) {
        return res.status(400).json({ msg: 'Minimum stock cannot be negative' });
      }
      inventoryFields.minStock = minStock;
    }
    if (unit) {
      inventoryFields.unit = unit;
    }

    // Validate stock relationships if all values are provided
    if (currentStock !== undefined && maxStock !== undefined && minStock !== undefined) {
      if (minStock > maxStock) {
        return res.status(400).json({ msg: 'Minimum stock cannot be greater than maximum stock' });
      }
      if (currentStock > maxStock) {
        return res.status(400).json({ msg: 'Current stock cannot be greater than maximum stock' });
      }
    }

    // Update lastUpdated timestamp
    inventoryFields.lastUpdated = new Date();

    let item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Inventory item not found' });
    }

    item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { $set: inventoryFields },
      { new: true }
    ).select('-__v');

    res.json(item);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Inventory item not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete an inventory item
// @access  Public (for now)
router.delete('/:id', async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Inventory item not found' });
    }

    await item.deleteOne();
    res.json({ msg: 'Inventory item removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Inventory item not found' });
    }
    res.status(500).send('Server Error');
  }
});

export default router; 
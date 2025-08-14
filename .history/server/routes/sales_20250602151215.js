const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Employee = require('../models/Employee');

// @route   GET /api/sales
// @desc    Get all sales with optional date range filter
// @access  Public (for now)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sales = await Sale.find(query)
      .populate('recordedBy', 'name')
      .select('-__v')
      .sort({ date: -1 });

    res.json(sales);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/sales/:id
// @desc    Get sale by ID
// @access  Public (for now)
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('recordedBy', 'name')
      .select('-__v');

    if (!sale) {
      return res.status(404).json({ msg: 'Sale not found' });
    }

    res.json(sale);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Sale not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/sales
// @desc    Create a new sale
// @access  Public (for now)
router.post('/', async (req, res) => {
  try {
    const {
      date,
      coin,
      hopper,
      soap,
      vending,
      dropOffAmount1,
      dropOffCode,
      dropOffAmount2,
      recordedBy
    } = req.body;

    // Verify employee exists
    const employee = await Employee.findById(recordedBy);
    if (!employee) {
      return res.status(400).json({ msg: 'Invalid employee ID' });
    }

    const sale = new Sale({
      date: date || Date.now(),
      coin,
      hopper,
      soap,
      vending,
      dropOffAmount1,
      dropOffCode,
      dropOffAmount2,
      recordedBy
    });

    await sale.save();
    
    const populatedSale = await Sale.findById(sale._id)
      .populate('recordedBy', 'name')
      .select('-__v');

    res.json(populatedSale);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/sales/:id
// @desc    Update a sale
// @access  Public (for now)
router.put('/:id', async (req, res) => {
  try {
    const {
      date,
      coin,
      hopper,
      soap,
      vending,
      dropOffAmount1,
      dropOffCode,
      dropOffAmount2,
      recordedBy
    } = req.body;

    // Build sale object
    const saleFields = {};
    if (date) saleFields.date = date;
    if (coin !== undefined) saleFields.coin = coin;
    if (hopper !== undefined) saleFields.hopper = hopper;
    if (soap !== undefined) saleFields.soap = soap;
    if (vending !== undefined) saleFields.vending = vending;
    if (dropOffAmount1 !== undefined) saleFields.dropOffAmount1 = dropOffAmount1;
    if (dropOffCode !== undefined) saleFields.dropOffCode = dropOffCode;
    if (dropOffAmount2 !== undefined) saleFields.dropOffAmount2 = dropOffAmount2;
    if (recordedBy) {
      // Verify employee exists
      const employee = await Employee.findById(recordedBy);
      if (!employee) {
        return res.status(400).json({ msg: 'Invalid employee ID' });
      }
      saleFields.recordedBy = recordedBy;
    }

    let sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ msg: 'Sale not found' });
    }

    sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { $set: saleFields },
      { new: true }
    )
      .populate('recordedBy', 'name')
      .select('-__v');

    res.json(sale);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Sale not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/sales/:id
// @desc    Delete a sale
// @access  Public (for now)
router.delete('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ msg: 'Sale not found' });
    }

    await sale.deleteOne();
    res.json({ msg: 'Sale removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Sale not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/sales/bulk
// @desc    Create multiple sales entries
// @access  Public (for now)
router.post('/bulk', async (req, res) => {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries)) {
      return res.status(400).json({ msg: 'Entries must be an array' });
    }

    const savedSales = [];
    
    // Process each entry
    for (const entry of entries) {
      const {
        date,
        coin,
        hopper,
        soap,
        vending,
        dropOffAmount1,
        dropOffCode,
        dropOffAmount2
      } = entry;

      const sale = new Sale({
        date: date || Date.now(),
        coin: coin || 0,
        hopper: hopper || 0,
        soap: soap || 0,
        vending: vending || 0,
        dropOffAmount1: dropOffAmount1 || 0,
        dropOffCode: dropOffCode || '',
        dropOffAmount2: dropOffAmount2 || 0
      });

      const savedSale = await sale.save();
      savedSales.push(savedSale);
    }

    res.json({
      message: `Successfully saved ${savedSales.length} sales entries`,
      sales: savedSales
    });
  } catch (err) {
    console.error('Error in bulk sales save:', err.message);
    res.status(500).json({ 
      msg: 'Server Error',
      error: err.message 
    });
  }
});

// @route   GET /api/sales/summary
// @desc    Get sales summary with totals for each field
// @access  Public (for now)
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({ msg: 'Both startDate and endDate are required' });
    }

    // Create aggregation pipeline
    const pipeline = [
      {
        $match: {
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: null,
          coinTotal: {
            $sum: { $toDouble: "$coin" }
          },
          hopperTotal: {
            $sum: { $toDouble: "$hopper" }
          },
          soapTotal: {
            $sum: { $toDouble: "$soap" }
          },
          vendingTotal: {
            $sum: { $toDouble: "$vending" }
          },
          dropOffAmount1Total: {
            $sum: { $toDouble: "$dropOffAmount1" }
          },
          dropOffAmount2Total: {
            $sum: { $toDouble: "$dropOffAmount2" }
          }
        }
      },
      {
        $project: {
          _id: 0,
          coinTotal: { $round: ["$coinTotal", 2] },
          hopperTotal: { $round: ["$hopperTotal", 2] },
          soapTotal: { $round: ["$soapTotal", 2] },
          vendingTotal: { $round: ["$vendingTotal", 2] },
          dropOffAmount1Total: { $round: ["$dropOffAmount1Total", 2] },
          dropOffAmount2Total: { $round: ["$dropOffAmount2Total", 2] }
        }
      }
    ];

    const results = await Sale.aggregate(pipeline);

    // If no results, return zeros
    const summary = results[0] || {
      coinTotal: 0,
      hopperTotal: 0,
      soapTotal: 0,
      vendingTotal: 0,
      dropOffAmount1Total: 0,
      dropOffAmount2Total: 0
    };

    res.json(summary);
  } catch (err) {
    console.error('Error in sales summary:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 
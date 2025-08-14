const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Employee = require('../models/Employee');

// Helper function to parse numeric value
const parseNumericValue = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// @route   GET /api/sales
// @desc    Get all sales with optional date range filter
// @access  Public (for now)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log('Received request with dates:', { startDate, endDate });

    let query = {};

    if (startDate && endDate) {
      query.Date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    // Add a count query first to check if we have any data
    const count = await Sale.countDocuments(query);
    console.log(`Found ${count} sales matching query`);

    const sales = await Sale.find(query)
      .sort({ Date: -1 }) // Sort by date descending
      .lean();
    
    console.log(`Retrieved ${sales.length} sales records`);

    // Log a sample record if available
    if (sales.length > 0) {
      console.log('Sample record:', JSON.stringify(sales[0], null, 2));
    }

    res.json(sales);
  } catch (err) {
    console.error('Error in sales route:', err);
    res.status(500).json({ 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
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
          Date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: null,
          coinTotal: { $sum: { $toDouble: "$Coin" } },
          hopperTotal: { $sum: { $toDouble: "$Hopper" } },
          soapTotal: { $sum: { $toDouble: "$Soap" } },
          vendingTotal: { $sum: { $toDouble: "$Vending" } },
          dropOffAmount1Total: { $sum: { $toDouble: "$Drop Off Amount 1" } },
          dropOffAmount2Total: { $sum: { $toDouble: "$Drop Off Amount 2" } }
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
      Date: date || Date.now(),
      Coin: parseNumericValue(coin),
      Hopper: parseNumericValue(hopper),
      Soap: parseNumericValue(soap),
      Vending: parseNumericValue(vending),
      'Drop Off Amount 1': parseNumericValue(dropOffAmount1),
      'Drop Off Code': dropOffCode || '',
      'Drop Off Amount 2': parseNumericValue(dropOffAmount2),
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
    if (date) saleFields.Date = date;
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

    // Format entries for bulk insert
    const formattedEntries = entries.map(entry => ({
      Date: entry.Date,
      Coin: parseNumericValue(entry.Coin),
      Hopper: parseNumericValue(entry.Hopper),
      Soap: parseNumericValue(entry.Soap),
      Vending: parseNumericValue(entry.Vending),
      'Drop Off Amount 1': parseNumericValue(entry['Drop Off Amount 1']),
      'Drop Off Code': entry['Drop Off Code'] || '',
      'Drop Off Amount 2': parseNumericValue(entry['Drop Off Amount 2']),
      isSaved: typeof entry.isSaved === 'string' ? entry.isSaved === 'true' : Boolean(entry.isSaved)
    }));

    // Use insertMany with ordered: false to continue even if some documents fail
    const result = await Sale.insertMany(formattedEntries, { 
      ordered: false,
      // Skip documents that would cause duplicate key errors
      rawResult: true
    }).catch(err => {
      // If it's a bulk write error, some documents might have been inserted
      if (err.name === 'BulkWriteError') {
        return {
          insertedDocs: err.insertedDocs,
          writeErrors: err.writeErrors,
          nInserted: err.result.nInserted
        };
      }
      throw err; // Re-throw if it's not a BulkWriteError
    });

    // Prepare response message
    let message = '';
    let nInserted = 0;

    if (result.insertedDocs) {
      // Handle case where some documents were inserted despite errors
      nInserted = result.nInserted;
      message = `Successfully saved ${nInserted} out of ${entries.length} sales entries. ${entries.length - nInserted} entries were duplicates.`;
    } else {
      // All documents were inserted successfully
      nInserted = result.insertedCount;
      message = `Successfully saved all ${nInserted} sales entries`;
    }

    res.json({
      message,
      nInserted,
      totalAttempted: entries.length
    });

  } catch (err) {
    console.error('Error in bulk sales save:', err);
    res.status(500).json({ 
      msg: 'Server Error',
      error: err.message 
    });
  }
});

module.exports = router; 
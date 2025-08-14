const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Timesheet = require('../models/Timesheet');

// @route   POST /api/sync
// @desc    Receive and save sales and timesheet data from frontend
// @access  Public (you might add auth later)
router.post('/', async (req, res) => {
  const { sales, timesheet } = req.body; // Expecting arrays of data

  try {
    const savedSales = [];
    const savedTimesheets = [];

    // Save new sales records
    if (sales && sales.length > 0) {
      // Filter out any records that might already exist (optional depending on your frontend logic)
      // A more robust sync would involve checking for existing records by a unique ID or timestamp
      const salesToSave = sales.map(sale => new Sale(sale));
      const insertSalesResult = await Sale.insertMany(salesToSave, { ordered: false }); // ordered: false allows saving valid docs even if some fail
      savedSales.push(...insertSalesResult);
    }

    // Save new timesheet records
    if (timesheet && timesheet.length > 0) {
      // Filter out any records that might already exist (optional)
      const timesheetsToSave = timesheet.map(entry => new Timesheet(entry));
       const insertTimesheetsResult = await Timesheet.insertMany(timesheetsToSave, { ordered: false });
       savedTimesheets.push(...insertTimesheetsResult);
    }

    res.json({ 
      message: 'Sync successful', 
      savedSalesCount: savedSales.length, 
      savedTimesheetsCount: savedTimesheets.length 
    });

  } catch (err) {
    console.error(err.message);
    // TODO: Implement more specific error handling and potentially return which records failed
    res.status(500).send('Server Error during sync');
  }
});

// TODO: Add a GET route to fetch data for the admin page (e.g., /api/sync/data?startDate=...&endDate=...)

module.exports = router; 
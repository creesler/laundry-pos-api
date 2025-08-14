const express = require('express');
const router = express.Router();
const Timesheet = require('../models/Timesheet');
const Employee = require('../models/Employee');

// @route   GET /api/timesheets
// @desc    Get all timesheets with optional filters
// @access  Public (for now)
router.get('/', async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;
    let query = {};

    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const timesheets = await Timesheet.find(query)
      .populate('employeeId', 'name')
      .select('-__v')
      .sort({ date: -1, clockIn: -1 });

    res.json(timesheets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/timesheets/:id
// @desc    Get timesheet by ID
// @access  Public (for now)
router.get('/:id', async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id)
      .populate('employeeId', 'name')
      .select('-__v');

    if (!timesheet) {
      return res.status(404).json({ msg: 'Timesheet entry not found' });
    }

    res.json(timesheet);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Timesheet entry not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/timesheets/employee/:employeeId
// @desc    Get timesheet summary for an employee within a date range
// @access  Public (for now)
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const employeeId = req.params.employeeId;

    // Validate employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({ msg: 'Start date and end date are required' });
    }

    // Find all timesheet entries for the employee within date range
    const timesheets = await Timesheet.find({
      employeeId,
      $or: [
        {
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        },
        {
          timeIn: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      ]
    })
    .sort({ date: 1, timeIn: 1 })
    .lean()
    .exec();

    console.log('Query params:', {
      employeeId,
      startDate,
      endDate
    });
    console.log('Found timesheets:', timesheets);

    // Process and pair the timesheet entries
    const processedEntries = [];

    for (const entry of timesheets) {
      if (entry.timeOut) {
        // This is a complete entry
        const durationHours = (new Date(entry.timeOut) - new Date(entry.timeIn)) / (1000 * 60 * 60);
        const regularHours = Math.min(durationHours, 8);
        const overtimeHours = Math.max(0, durationHours - 8);

        processedEntries.push({
          timeIn: entry.timeIn,
          timeOut: entry.timeOut,
          regularHours,
          overtimeHours,
          totalHours: durationHours
        });
      }
    }

    // Calculate totals
    const summary = processedEntries.reduce((acc, entry) => {
      acc.totalRegularHours += entry.regularHours;
      acc.totalOvertimeHours += entry.overtimeHours;
      acc.totalHours += entry.totalHours;
      return acc;
    }, {
      totalRegularHours: 0,
      totalOvertimeHours: 0,
      totalHours: 0
    });

    // Calculate pay
    summary.regularPay = summary.totalRegularHours * 15; // $15/hour
    summary.overtimePay = summary.totalOvertimeHours * 22.5; // $22.50/hour
    summary.totalPay = summary.regularPay + summary.overtimePay;

    res.json({
      employeeId,
      employeeName: employee.name,
      startDate,
      endDate,
      entries: processedEntries,
      summary
    });

  } catch (err) {
    console.error('Error fetching timesheet summary:', err);
    res.status(500).json({ 
      msg: 'Server Error', 
      error: err.message 
    });
  }
});

// @route   POST /api/timesheets/clock-in
// @desc    Clock in an employee
// @access  Public (for now)
router.post('/clock-in', async (req, res) => {
  try {
    const { employeeId } = req.body;

    // Verify employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(400).json({ msg: 'Invalid employee ID' });
    }

    // Check if employee already has an active timesheet
    const activeTimesheet = await Timesheet.findOne({
      employeeId,
      status: 'pending'
    });

    if (activeTimesheet) {
      return res.status(400).json({ msg: 'Employee already clocked in' });
    }

    const now = new Date();
    const timesheet = new Timesheet({
      employeeId,
      employeeName: employee.name,
      date: now,
      timeIn: now,
      status: 'pending'
    });

    await timesheet.save();
    res.json(timesheet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/timesheets/clock-out
// @desc    Clock out an employee
// @access  Public (for now)
router.post('/clock-out', async (req, res) => {
  try {
    const { employeeId } = req.body;

    // Find active timesheet
    const timesheet = await Timesheet.findOne({
      employeeId,
      status: 'pending'
    });

    if (!timesheet) {
      return res.status(400).json({ msg: 'No active clock-in found' });
    }

    timesheet.timeOut = new Date();
    timesheet.status = 'completed';
    await timesheet.save();

    res.json(timesheet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/timesheets/:id
// @desc    Update a timesheet entry
// @access  Public (for now)
router.put('/:id', async (req, res) => {
  try {
    const { clockIn, clockOut } = req.body;

    const timesheet = await Timesheet.findById(req.params.id);
    if (!timesheet) {
      return res.status(404).json({ msg: 'Timesheet entry not found' });
    }

    if (clockIn) timesheet.clockIn = new Date(clockIn);
    if (clockOut) timesheet.clockOut = new Date(clockOut);

    await timesheet.save();

    const populatedTimesheet = await Timesheet.findById(timesheet._id)
      .populate('employeeId', 'name')
      .select('-__v');

    res.json(populatedTimesheet);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Timesheet entry not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/timesheets/:id
// @desc    Delete a timesheet entry
// @access  Public (for now)
router.delete('/:id', async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);
    if (!timesheet) {
      return res.status(404).json({ msg: 'Timesheet entry not found' });
    }

    await timesheet.deleteOne();
    res.json({ msg: 'Timesheet entry removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Timesheet entry not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Bulk create timesheets
router.post('/bulk', async (req, res) => {
  try {
    const { employeeName, entries } = req.body;

    // Find employee by name
    const employee = await Employee.findOne({ name: employeeName });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Create timesheet entries
    const timesheetPromises = entries.map(entry => {
      const date = new Date(entry.date);
      const [hours, minutes] = entry.time.split(':');
      const isPM = entry.time.toLowerCase().includes('pm');
      
      // Adjust hours for PM times
      let adjustedHours = parseInt(hours);
      if (isPM && adjustedHours !== 12) adjustedHours += 12;
      if (!isPM && adjustedHours === 12) adjustedHours = 0;

      date.setHours(adjustedHours, parseInt(minutes) || 0);

      const timesheet = new Timesheet({
        employeeId: employee._id,
        employeeName: employee.name,
        date: date,
        timeIn: date,
        status: 'pending'
      });

      if (entry.action === 'out') {
        // Find the matching clock-in entry and update it
        return Timesheet.findOneAndUpdate(
          {
            employeeId: employee._id,
            status: 'pending',
            date: {
              $lte: date,
              $gte: new Date(date.getTime() - 24 * 60 * 60 * 1000) // Look back 24 hours
            }
          },
          {
            $set: {
              timeOut: date,
              status: 'completed'
            }
          },
          { new: true }
        );
      }

      return timesheet.save();
    });

    await Promise.all(timesheetPromises);

    res.status(200).json({ 
      message: 'Timesheets saved successfully',
      count: entries.length
    });
  } catch (error) {
    console.error('Error saving timesheets:', error);
    res.status(500).json({ message: 'Error saving timesheets', error: error.message });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// @route   GET /api/employees
// @desc    Get all employees
// @access  Public (you might add auth later)
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().select('name contactNumber address'); // Only return necessary fields
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/employees
// @desc    Add a new employee (Admin functionality - can be removed or protected later)
// @access  Public (should be protected)
router.post('/', async (req, res) => {
  const { name, contactNumber, address } = req.body;
  try {
    let employee = await Employee.findOne({ name });
    if (employee) {
      return res.status(400).json({ msg: 'Employee already exists' });
    }
    employee = new Employee({
      name,
      contactNumber,
      address
    });
    await employee.save();
    res.json(employee);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// TODO: Add PUT (update) and DELETE routes for employees (admin functions)

module.exports = router; 
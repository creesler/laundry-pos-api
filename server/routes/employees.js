import express from 'express';
import Employee from '../models/Employee.js';
import cors from 'cors';

const router = express.Router();

// Enable CORS specifically for this route
router.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle OPTIONS requests
router.options('*', cors(), (req, res) => {
  res.status(204).send();
});

// @route   GET /api/employees
// @desc    Get all employees
// @access  Public (for now)
router.get('/', async (req, res) => {
  try {
    // Set CORS headers explicitly
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const { status } = req.query;
    const query = status ? { status } : { status: 'active' }; // Default to active employees
    
    const employees = await Employee.find(query)
      .select('-__v')
      .sort({ name: 1 });
    
    console.log(`📋 Fetched ${employees.length} employees with status: ${status || 'active'}`);
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/employees/:id
// @desc    Get employee by ID
// @access  Public (for now)
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-__v');
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    res.json(employee);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/employees
// @desc    Create a new employee
// @access  Public (for now)
router.post('/', async (req, res) => {
  try {
    const { name, contactNumber, address, role } = req.body;

    // Check if employee already exists
    let employee = await Employee.findOne({ name });
    if (employee) {
      return res.status(400).json({ msg: 'Employee already exists' });
    }

    // Create new employee
    employee = new Employee({
      name,
      contactNumber,
      address,
      role: role || 'staff'
    });

    await employee.save();
    res.json(employee);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/employees/:id
// @desc    Update an employee
// @access  Public (for now)
router.put('/:id', async (req, res) => {
  try {
    const { name, contactNumber, address, status, role } = req.body;

    // Build employee object
    const employeeFields = {};
    if (name) employeeFields.name = name;
    if (contactNumber) employeeFields.contactNumber = contactNumber;
    if (address) employeeFields.address = address;
    if (status) employeeFields.status = status;
    if (role) employeeFields.role = role;

    let employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    // Make sure name is unique if it's being updated
    if (name && name !== employee.name) {
      const existingEmployee = await Employee.findOne({ name });
      if (existingEmployee) {
        return res.status(400).json({ msg: 'That name is already taken' });
      }
    }

    employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: employeeFields },
      { new: true }
    ).select('-__v');

    res.json(employee);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete an employee
// @access  Public (for now)
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    await employee.deleteOne();
    res.json({ msg: 'Employee removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    res.status(500).send('Server Error');
  }
});

export default router; 
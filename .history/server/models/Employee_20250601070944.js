const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  contactNumber: { type: String },
  address: { type: String },
  // Add any other employee-specific fields here
});

module.exports = mongoose.model('Employee', EmployeeSchema); 
const mongoose = require('mongoose');

const TimesheetSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true }, // Raw time string (e.g., "9:00 AM")
  action: { type: String, enum: ['in', 'out'], required: true },
  employeeName: { type: String, required: true },
  isSaved: { type: Boolean, default: true }, // Assuming data sent to server is saved
  createdAt: { type: Date, default: Date.now },
  // Add a field to link to a specific tablet/device if needed for multi-device sync
  // deviceId: { type: String }
});

module.exports = mongoose.model('Timesheet', TimesheetSchema); 
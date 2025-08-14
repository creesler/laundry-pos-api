const mongoose = require('mongoose');

const TimesheetSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  clockIn: {
    type: Date,
    required: true
  },
  clockOut: {
    type: Date
  },
  duration: {
    type: Number,  // Duration in minutes
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate duration before saving if clockOut exists
TimesheetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.clockOut && this.clockIn) {
    const durationMs = this.clockOut.getTime() - this.clockIn.getTime();
    this.duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
    this.status = 'completed';
  }
  
  next();
});

module.exports = mongoose.model('Timesheet', TimesheetSchema); 
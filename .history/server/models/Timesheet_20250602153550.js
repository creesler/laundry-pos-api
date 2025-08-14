const mongoose = require('mongoose');

const TimesheetSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeIn: {
    type: Date,
    required: true
  },
  timeOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String
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

// Virtual for duration in hours
TimesheetSchema.virtual('durationHours').get(function() {
  if (!this.timeOut) return 0;
  return (this.timeOut - this.timeIn) / (1000 * 60 * 60);
});

// Update timestamp before saving
TimesheetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure virtuals are included in JSON
TimesheetSchema.set('toJSON', { virtuals: true });
TimesheetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Timesheet', TimesheetSchema); 
const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  date: { 
    type: Date,
    required: true,
    default: Date.now
  },
  coin: {
    type: Number,
    default: 0
  },
  hopper: {
    type: Number,
    default: 0
  },
  soap: {
    type: Number,
    default: 0
  },
  vending: {
    type: Number,
    default: 0
  },
  dropOffAmount1: {
    type: Number,
    default: 0
  },
  dropOffCode: {
    type: String,
    trim: true
  },
  dropOffAmount2: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
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

// Calculate total amount before saving
SaleSchema.pre('save', function(next) {
  this.totalAmount = (
    this.coin +
    this.hopper +
    this.soap +
    this.vending +
    this.dropOffAmount1 +
    this.dropOffAmount2
  );
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Sale', SaleSchema); 
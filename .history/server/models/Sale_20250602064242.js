const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  Date: {
    type: String,
    required: true
  },
  Coin: {
    type: String,
    default: ''
  },
  Hopper: {
    type: String,
    default: ''
  },
  Soap: {
    type: String,
    default: ''
  },
  Vending: {
    type: String,
    default: ''
  },
  'Drop Off Amount 1': {
    type: String,
    default: ''
  },
  'Drop Off Code': {
    type: String,
    default: ''
  },
  'Drop Off Amount 2': {
    type: String,
    default: ''
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

// Add compound index for uniqueness
SaleSchema.index({ Date: 1, 'Drop Off Code': 1 }, { unique: true, sparse: true });

// Update timestamp before saving
SaleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Sale', SaleSchema); 
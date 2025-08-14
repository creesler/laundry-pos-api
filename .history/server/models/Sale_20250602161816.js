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
  isSaved: {
    type: mongoose.Schema.Types.Mixed,
    default: true,
    get: v => typeof v === 'string' ? v === 'true' : Boolean(v)
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

module.exports = mongoose.model('Sale', SaleSchema);
const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    enum: ['Soap', 'Detergent']
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    max: 100, // Percentage
    default: 100
  },
  lastRefillDate: {
    type: Date,
    default: Date.now
  },
  lowStockThreshold: {
    type: Number,
    default: 20 // Percentage
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

// Update timestamp before saving
InventorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Inventory', InventorySchema); 
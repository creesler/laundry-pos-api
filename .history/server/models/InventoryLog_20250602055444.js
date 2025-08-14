const mongoose = require('mongoose');

const InventoryLogSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  updateType: {
    type: String,
    enum: ['restock', 'usage', 'adjustment'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
});

module.exports = mongoose.model('InventoryLog', InventoryLogSchema); 
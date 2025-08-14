const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  Date: { type: String, required: true }, // Storing as string for now based on your format
  Coin: { type: String },
  Hopper: { type: String },
  Soap: { type: String },
  Vending: { type: String },
  'Drop Off Amount 1': { type: String },
  'Drop Off Code': { type: String },
  'Drop Off Amount 2': { type: String },
  isSaved: { type: Boolean, default: true }, // Assuming data sent to server is saved
  createdAt: { type: Date, default: Date.now },
  // Add a field to link to a specific tablet/device if needed for multi-device sync
  // deviceId: { type: String }
});

module.exports = mongoose.model('Sale', SaleSchema); 
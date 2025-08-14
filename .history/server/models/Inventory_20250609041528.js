import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  maxStock: {
    type: Number,
    required: true,
    min: 0,
    default: 100
  },
  minStock: {
    type: Number,
    required: true,
    min: 0,
    default: 20
  },
  unit: {
    type: String,
    required: true,
    default: 'units'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
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

// Add index for faster queries
InventorySchema.index({ name: 1 });
InventorySchema.index({ lastUpdated: -1 });

// Update timestamp before saving
InventorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.lastUpdated = Date.now();
  next();
});

// Transform the document when converting to JSON
InventorySchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.lastUpdated = ret.lastUpdated.toISOString();
    delete ret.__v;
    return ret;
  }
});

const Inventory = mongoose.model('Inventory', InventorySchema);
export default Inventory; 
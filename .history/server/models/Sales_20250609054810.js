const SalesSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  coin: {
    type: Number,
    required: true,
    default: 0
  },
  hopper: {
    type: Number,
    required: true,
    default: 0
  },
  soap: {
    type: Number,
    required: true,
    default: 0
  },
  vending: {
    type: Number,
    required: true,
    default: 0
  },
  drop_off_1: {
    type: Number,
    required: true,
    default: 0
  },
  drop_off_2: {
    type: Number,
    required: true,
    default: 0
  },
  drop_off_3: {
    type: Number,
    required: true,
    default: 0
  }
});

// Add index for faster queries
SalesSchema.index({ timestamp: -1 });

// Calculate total before saving
SalesSchema.pre('save', function(next) {
  this.total = this.coin + this.hopper + this.soap + this.vending + 
               this.drop_off_1 + this.drop_off_2 + this.drop_off_3;
  next();
}); 
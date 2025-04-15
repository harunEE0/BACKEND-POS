const mongoose = require('mongoose');

const InventoryLogSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['in', 'out', 'adjustment'],
    required: true,
  },
  reference: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  note: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('InventoryLog', InventoryLogSchema);
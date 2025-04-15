const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }, { timestamps: true });


  module.exports = mongoose.model('OrderItem', orderItemSchema);
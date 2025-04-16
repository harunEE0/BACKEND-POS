const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    enum: ['cash', 'credit_card', 'transfer', 'other'],
    required: true,
  },
  change: {
    type: Number,
    default: 0,
  },
  transactionId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
PaymentSchema.post('save', async function(doc) {
  if (doc.status === 'completed') {
    await mongoose.model('Order').findByIdAndUpdate(doc.order, {
      paymentStatus: 'paid'
    });
  }
});
module.exports = mongoose.model('Payment', PaymentSchema);
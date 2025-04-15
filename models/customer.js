const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
  },
  address: String,
  points: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
CustomerSchema.post('save', async function() {
  await mongoose.model('DashboardStats').updateDashboardStats();
});

module.exports = mongoose.model('Customer', CustomerSchema);
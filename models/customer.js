
//E:\learn-code\backend-pos\models\customer.js
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
  try {
    await mongoose.model('DashboardStats').updateDashboard(); // เปลี่ยนจาก updateDashboardStats()
  } catch (err) {
    console.error('Failed to update dashboard:', err);
  }
});
CustomerSchema.post('deleteOne', { document: true }, async function() {
  try {
    await mongoose.model('DashboardStats').updateDashboard();
  } catch (err) {
    console.error('Failed to update dashboard after delete:', err);
  }
});
module.exports = mongoose.model('Customer', CustomerSchema);
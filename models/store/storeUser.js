
//E:\learn-code\backend-pos\models\store\storeUser.js


const mongoose = require('mongoose');

const storeUserSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'cashier'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ทำให้ store และ user เป็น unique คู่กัน
storeUserSchema.index({ store: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('StoreUser', storeUserSchema);
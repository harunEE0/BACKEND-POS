//E:\learn-code\backend-pos\models\store\store.js

const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  address: String,
  contact: String,
  logo: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Store', storeSchema);
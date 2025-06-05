//E:\learn-code\backend-pos\models\DashboardStats.js
const mongoose = require('mongoose');
const cacheService = require('../services/cacheService');
const logger = require('../utils/logger');

const dashboardStatsSchema = new mongoose.Schema({
   store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  // ส่วนของ Products
  products: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product',
      index: true // เพิ่ม index เพื่อประสิทธิภาพ
    },
    name: {
      type: String,
      trim: true
    },
    stock: {
      type: Number,
      min: 0
    }
  }],

  // ส่วนของ Orders อัพวันต่อวัน
  todayOrders: [{
    orderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Order',
      index: true
    },
    productName: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      min: 1
    },
    price: {
      type: Number,
      min: 0
    },
    timestamp: { 
      type: Date, 
      default: Date.now,
      index: true 
    }
  }],

  // ส่วนของ Customers 
 customers: [
  { 
       customerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
       },
       name:{
        type : String,
        trim : true
       },
       phone:{
        type: String
       }
      }
 ],
      
  totalCustomers: { 
    type: Number,
    default: 0 
  },


  // ส่วนของ Payments  อัพวันต่อวัน
 todayPayments: [{
    paymentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Payment',
      index: true
    },
    amount: {
      type: Number,
      min: 0
    },
    method: {
      type: String,
      enum: ['cash', 'credit', 'transfer', 'other']
    },
    timestamp: { 
      type: Date, 
      default: Date.now,
      index: true 
    }
  }],

  lastUpdated: { 
    type: Date, 
    default: Date.now,
    index: true 
   }
}, { timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
 });


dashboardStatsSchema.statics.updateDashboard = async function(storeId) {
  try {
    const today = new Date();
  today.setHours(0, 0, 0, 0); // เริ่มต้นวันเวลา 00:00:00

   // ดึงข้อมูลแบบ parallel ด้วย Promise.all
    const [products, todayOrders, customers, todayPayments] = await Promise.all([
      this.getProductsData(storeId),
      this.getTodayOrdersData(today,storeId),
      this.getCustomerData(storeId),
      this.getTodayPaymentsData(today,storeId)
    ]);
     const formattedData = {
       store: storeId,
      products,
      todayOrders,
      customers,
      totalCustomers: customers.length,
      todayPayments,
      lastUpdated: new Date()
    };
  
     const updatedStats = await this.findOneAndUpdate(
      { store: storeId },
      formattedData,
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );
    logger.info(`Dashboard updated for store ${storeId} and cache flushed`);
     return updatedStats;
  } catch (error) {
    logger.error(`Error updating dashboard for store ${storeId}: ${error.message}`);
    throw error;
    
  }
};

// Helper method สำหรับดึงข้อมูลสินค้า
dashboardStatsSchema.statics.getProductsData = async function(storeId) {
  return mongoose.model('Product')
    .find({ store: storeId })
    .sort('_id')
    .select('name stock')
    .lean();
};

// Helper method สำหรับดึงคำสั่งซื้อวันนี้
dashboardStatsSchema.statics.getTodayOrdersData = async function(today, storeId) {
  return mongoose.model('Order')
    .find({
      store: storeId,
      createdAt: { $gte: today },
      paymentStatus: 'paid'
    })
    .sort('-createdAt')
    .populate({
      path: 'items.product',
      select: 'name'
    })
    .lean();
};

// Helper method สำหรับนับจำนวนลูกค้า
dashboardStatsSchema.statics.getCustomerData = async function(storeId) {
  return mongoose.model('Customer')
  .find({store: storeId})
  .sort('name')
  .select('name phone')
  .lean()
};

// Helper method สำหรับดึงการชำระเงินวันนี้
dashboardStatsSchema.statics.getTodayPaymentsData = async function(today, storeId) {
  return mongoose.model('Payment')
    .find({
      createdAt: { $gte: today },
      status: 'completed'
    })
    .populate({
      path: 'order',
      match: { store: storeId },
      select: 'orderNumber'
    })
    .lean()
    .then(payments => payments.filter(p => p.order));
};

// อัปเดต Dashboard ทุกครั้งที่เรียกใช้

// Indexes สำหรับการค้นหาที่รวดเร็ว
dashboardStatsSchema.index({ lastUpdated: 1 });
dashboardStatsSchema.index({ 'products.productId': 1 });
dashboardStatsSchema.index({ 'todayOrders.orderId': 1 });
dashboardStatsSchema.index({ 'todayPayments.paymentId': 1 });
dashboardStatsSchema.index({ 'todayOrders.timestamp': 1 });
dashboardStatsSchema.index({ 'todayPayments.timestamp': 1 });

const DashboardStats = mongoose.model('DashboardStats', dashboardStatsSchema);
module.exports = DashboardStats;
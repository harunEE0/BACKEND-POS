//E:\learn-code\backend-pos\models\DashboardStats.js
const mongoose = require('mongoose');

const dashboardStatsSchema = new mongoose.Schema({
  // ส่วนของ Products
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    stock: Number
  }],

  // ส่วนของ Orders อัพวันต่อวัน
  todayOrders: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    productName: String,
    quantity: Number,
    price: Number,
    timestamp: { type: Date, default: Date.now }
  }],

  // ส่วนของ Customers 
  totalCustomers: { type: Number, default: 0 },

  // ส่วนของ Payments  อัพวันต่อวัน
  todayPayments: [{
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    amount: Number,
    method: String,
    timestamp: { type: Date, default: Date.now }
  }],

  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });


dashboardStatsSchema.statics.updateDashboard = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // เริ่มต้นวันเวลา 00:00:00

  // อัปเดต Products (เรียงตาม _id)
  const products = await mongoose.model('Product')
    .find({})
    .sort('_id')
    .select('name stock');

  //  อัปเดต Orders วันนี้
  const todayOrders = await mongoose.model('Order')
    .find({
      createdAt: { $gte: today },
      paymentStatus: 'paid'
    })
    .sort('-createdAt')
    .populate({
      path: 'items.product',
      select: 'name'
    });

  //  อัปเดต Customer Count
  const customerCount = await mongoose.model('Customer')
    .countDocuments();

  //  อัปเดต Payments วันนี้
  const todayPayments = await mongoose.model('Payment')
    .find({
      createdAt: { $gte: today },
      status: 'completed'
    })
    .populate({
      path: 'order',
      select: 'orderNumber'
    });

  // จัดรูปแบบข้อมูล
  const formattedData = {
    products: products.map(p => ({
      _id: p._id,
      name: p.name,
      stock: p.stock
    })),
    todayOrders: todayOrders.map(o => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      items: o.items.map(i => ({
        productName: i.product.name,
        quantity: i.quantity,
        price: i.price
      })),
      total: o.total,
      createdAt: o.createdAt
    })),
    totalCustomers: await mongoose.model('Customer').countDocuments(),
    todayPayments: todayPayments.map(p => ({
      _id: p._id,
      orderNumber: p.order.orderNumber,
      amount: p.amount,
      method: p.method,
      createdAt: p.createdAt
    })),
    lastUpdated: new Date()
  };

  // อัปเดตข้อมูล
  return this.findOneAndUpdate(
    {},
    formattedData,
    { upsert: true, new: true }
  );
};

// อัปเดต Dashboard ทุกครั้งที่เรียกใช้
dashboardStatsSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});
dashboardStatsSchema.index({ lastUpdated: 1 }); // สำหรับตรวจสอบข้อมูลเก่า
dashboardStatsSchema.index({ 'products._id': 1 }); // สำหรับค้นหาสินค้า
dashboardStatsSchema.index({ 'todayOrders._id': 1 }); // สำหรับค้นหาออเดอร์
dashboardStatsSchema.index({ 'todayPayments._id': 1 }); // สำหรับค้นหาการชำระเงิน

const DashboardStats = mongoose.model('DashboardStats', dashboardStatsSchema);
module.exports = DashboardStats;
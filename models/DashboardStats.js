const mongoose = require('mongoose');

const dashboardStatsSchema = new mongoose.Schema({
  totalSales: { type: Number, default: 0 },
  todaySales: { type: Number, default: 0 },
  monthlySales: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  todayOrders: { type: Number, default: 0 },
  totalCustomers: { type: Number, default: 0 },
  newCustomers: { type: Number, default: 0 },
  topSellingProducts: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantitySold: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  }],
  salesByCategory: [{
    category: String,
    totalSales: Number
  }],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });



 dashboardStatsSchema.statics.updateDashboardStats = async function (stats) {
  const today = new Date();

  const startofMonth = new Date(today.getFullYear(), today.getMonth(),1);

   const [totalSale, todaySales, monthlySales ] = await Promise.all([
    this.calculateTotalSales(),
    this.calculateSalesSince(today),
    this.calculateSalesSince(startOfMonth)
   ])
   const [totalOrders, todayOrders] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: today } })
  ]);
  
  const [totalCustomers, newCustomers] = await Promise.all([
    Customer.countDocuments(),
    Customer.countDocuments({ createdAt: { $gte: today } })
  ]);
  const topSellingProducts = await this.getTopSellingProducts();
  const salesByCategory = await this.getSalesByCategory();
  
  // อัปเดตข้อมูล
  return this.findOneAndUpdate(
    {},
    {
      totalSales,
      todaySales,
      monthlySales,
      totalOrders,
      todayOrders,
      totalCustomers,
      newCustomers,
      topSellingProducts,
      salesByCategory,
      lastUpdated: new Date()
    },
    { upsert: true, new: true }
  );
 };
 dashboardStatsSchema.statics.updateStats = async function() {
  const stats = await this.findOneAndUpdate(
    {},
    { 
      $set: {
        totalSales: await mongoose.model('Order').aggregate([...]),
        totalOrders: await mongoose.model('Order').countDocuments(),
        // ... คำนวณค่าอื่นๆ
      } 
    },
    { upsert: true, new: true }
  );
  return stats;
};

 dashboardStatsSchema.statics.calculateTotalSales = async function() {
    const result = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])
    return result[0]?.total || 0;
 };
 dashboardStatsSchema.statics.calculateSalesSince = async function(startDate) {
  const result = await Order.aggregate([
    { 
      $match: { 
        paymentStatus: 'paid',
        createdAt: { $gte: startDate }
      } 
    },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);
  return result[0]?.total || 0;
};
dashboardStatsSchema.statics.getTopSellingProducts = async function(limit = 5) {
  return Order.aggregate([
    { $unwind: '$items' },
    { 
      $group: { 
        _id: '$items.product',
        quantitySold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      } 
    },
    { $sort: { quantitySold: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' },
    {
      $project: {
        product: '$_id',
        quantitySold: 1,
        revenue: 1,
        productName: '$productDetails.name',
        _id: 0
      }
    }
  ]);
};
dashboardStatsSchema.statics.getSalesByCategory = async function() {
  return Order.aggregate([
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' },
    { 
      $group: { 
        _id: '$productDetails.category',
        totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      } 
    },
    { $sort: { totalSales: -1 } },
    {
      $project: {
        category: '$_id',
        totalSales: 1,
        _id: 0
      }
    }
  ]);
};

module.exports = mongoose.model('DashboardStats', dashboardStatsSchema);

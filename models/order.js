const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
      },
      items: [{
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
          default: 0,
        },
      }],
      subtotal: {
        type: Number,
        required: true,
      },
      tax: {
        type: Number,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'cancelled', 'refunded'],
        default: 'pending',
      },
      paymentMethod: {
        type: String,
        enum: ['cash', 'credit_card', 'transfer', 'other'],
        default: 'cash',
      },
      store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
      createdAt: {
        type: Date,
        default: Date.now,
      },

},{ timestamps: true });
/** โครงสร้างเดิมที่มีปัญหา เพราะไม่ได้สามารถ reference ไปที่ model อย่างถูกต้องเพะราะว่าใช้ this.constructor
 * OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }
  next();
});
 */

   /** OrderSchema.pre('save', async function(next) {
      if (!this.orderNumber) {
        const random = Math.floor(1000 + Math.random() * 9000);
        this.orderNumber = `ORD-${Date.now()}-${random}`;
      }
        next();
    }) */

OrderSchema.pre('save', async function(next) {
  if(!this.orderNumber){
    const OrderModel = mongoose.model('Order');
    const count = await OrderModel.countDocuments();
    this.orderNumber = `ORD-${this.store.toString().slice(-4)}-${Date.now()}-${count + 1}`;
  }
});
OrderSchema.post('save', async function(doc) {
  if(doc.paymentStatus === 'paid'){
    await mongoose.model('DaashboardStats').updateDashboardStats(doc.store)
  }
});



   



    module.exports = mongoose.model('Order', OrderSchema);
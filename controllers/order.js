/**backend-pos/controller/order */


const Order = require('../models/order');
const Product = require('../models/product');
const InventoryLog = require('../models/inventory');
const Customer = require('../models/customer');




exports.getOrders = async (req, res, next) => {
    try {
      let query;
      console.log(req.params.id);
  
      // Basic find
      if (req.params.id) {
        query = Order.findById(req.params.id)
          .populate('user', 'username')
          .populate('customer', 'name phone')
          .populate('items.product', 'name price');
      } else {
        query = Order.find()
          .populate('user', 'username')
          .populate('customer', 'name phone')
          .populate('items.product', 'name price');
      }
  
      // Date filtering
      if (req.query.startDate && req.query.endDate) {
        query = query.where('createdAt').gte(new Date(req.query.startDate)).lte(new Date(req.query.endDate));
      }
  
      // Status filtering
      if (req.query.status) {
        query = query.where('paymentStatus').equals(req.query.status);
      }
  
      const orders = await query.sort('-createdAt');
      console.log(orders);
  
      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (err) {
      next(err);
    }
  };
  
  exports.createOrder = async (req, res, next) => {
    try {
      const { items, customerId, discount, paymentMethod } = req.body;
  
      // Validate items
      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please add at least one item to the order',
        });
      }
  
      // Calculate order totals
      let subtotal = 0;
      const populatedItems = [];
  
      for (const item of items) {
        const product = await Product.findById(item.product);
  
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product not found with id ${item.product}`,
          });
        }
  
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product ${product.name}`,
          });
        }
  
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
  
        populatedItems.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price,
        });
  
        // Update product stock
        product.stock -= item.quantity;
        await product.save();
  
        // Log inventory change
        await InventoryLog.create({
          product: product._id,
          quantity: item.quantity,
          type: 'out',
          reference: 'order',
          user: req.user.id,
        });
      }
  
      // Calculate tax (example: 7%)
      const tax = subtotal * 0.07;
      const total = subtotal + tax - (discount || 0);
  
      // Create order
      const order = await Order.create({
        user: req.user.id,
        customer: customerId,
        items: populatedItems,
        subtotal,
        tax,
        discount: discount || 0,
        total,
        paymentMethod,
      });
      console.log(order)
  
      // Update customer points if exists (example: 1 point per 100 baht)
      if (customerId) {
        const customer = await Customer.findById(customerId);
        if (customer) {
          const pointsEarned = Math.floor(total / 100);
          customer.points += pointsEarned;
          await customer.save();
        }
      }
  
      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  };
  
  exports.updateOrderStatus = async (req, res, next) => {
    try {
      const { status } = req.body;
  
      const order = await Order.findById(req.params.id);
  
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }
  
      order.paymentStatus = status;
      await order.save();
  
      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  };
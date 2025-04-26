/**backend-pos/controller/payment */


const Payment = require('../models/payment');
const Order = require('../models/order')


exports.processPayment = async (req, res, next) => {
    try {
      const { orderId, amount, method, transactionId } = req.body;
  
      const order = await Order.findById(orderId);
  
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }
  
      if (order.paymentStatus !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Order payment status is not pending',
        });
      }
  
      // Calculate change if payment method is cash
      let change = 0;
      if (method === 'cash' && amount > order.total) {
        change = amount - order.total;
      } else if (amount < order.total) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount is less than order total',
        });
      }
  
      // Create payment record
      const payment = await Payment.create({
        order: orderId,
        amount,
        method,
        change,
        transactionId,
        status: 'completed',
      });
  
      // Update order status
      order.paymentStatus = 'paid';
      await order.save();
  
      res.status(201).json({
        success: true,
        data: payment,
      });
    } catch (err) {
      next(err);
    }
  };
  
  exports.getPayments = async (req, res, next) => {
    try {
      const payments = await Payment.find().populate('order');
      res.status(200).json({
        success: true,
        count: payments.length,
        data: payments,
      });
    } catch (err) {
      next(err);
    }
  };

  exports.processRefund = async (req, res, next) => {
    try {
      const refund = await paymentService.processRefund({
        paymentId: req.params.id,
        amount: req.body.amount,
        userId: req.user.id
      });
      res.json({ success: true, data: refund });
    } catch (err) {
      next(err);
    }
  };
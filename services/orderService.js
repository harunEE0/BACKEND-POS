/**backend-pos/services/orderService */
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

exports.createOrder = async (orderData) => {
  const order = new Order(orderData);
  await order.save();

  const items = await Promise.all(
    orderData.items.map(async (item) => {
      const orderItem = new OrderItem({ ...item, order: order._id });
      await orderItem.save();
      return orderItem;
    })
  );

  order.items = items.map(i => i._id);
  await order.save();

  return order;
};

exports.getOrders = async () => {
  return await Order.find().populate('items').sort({ createdAt: -1 });
};

exports.updateOrderStatus = async (orderId, status) => {
  const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
  return updatedOrder;
};

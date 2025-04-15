/**E:\learn-code\backend-pos\sockets\orderSocket.js */
const Order = require('../models/Order');

const orderSocket = (io, socket) => {
  console.log(`OrderSocket connected: ${socket.id}`);

  // เมื่อมีการอัพเดตสถานะคำสั่งซื้อ
  socket.on('updateOrderStatus', async (orderId, status) => {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
      io.emit('orderStatusUpdated', updatedOrder);  // ส่งข้อมูลไปยังผู้เชื่อมต่อทั้งหมด
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  });

  // เมื่อมีคำสั่งซื้อใหม่
  socket.on('newOrder', async (orderData) => {
    try {
      const order = await Order.create(orderData);
      io.emit('newOrderCreated', order);  // ส่งข้อมูลคำสั่งซื้อใหม่ไปยังผู้เชื่อมต่อทั้งหมด
    } catch (err) {
      console.error('Error creating new order:', err);
    }
  });

  // เมื่อ socket disconnect
  socket.on('disconnect', () => {
    console.log(`OrderSocket disconnected: ${socket.id}`);
  });
};

module.exports = orderSocket;

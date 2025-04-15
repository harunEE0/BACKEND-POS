/**backend-pos\sockets\notificationSocket.js */

const Notification = require('../models/Notification');  // ใช้โมเดล Notification ถ้ามี

const notificationSocket = (io, socket) => {
  console.log(`NotificationSocket connected: ${socket.id}`);

  // ส่งการแจ้งเตือนใหม่ไปยังผู้เชื่อมต่อ
  socket.on('sendNotification', async (notificationData) => {
    try {
      const notification = await Notification.create(notificationData);
      io.emit('newNotification', notification);  // ส่งการแจ้งเตือนไปยังผู้เชื่อมต่อทั้งหมด
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  });

  // รับการแจ้งเตือนใหม่
  socket.on('receiveNotification', (notification) => {
    console.log('New notification:', notification);
    socket.emit('newNotificationReceived', notification);  // ส่งกลับไปยัง client ที่ร้องขอ
  });

  // เมื่อ socket disconnect
  socket.on('disconnect', () => {
    console.log(`NotificationSocket disconnected: ${socket.id}`);
  });
};

module.exports = notificationSocket;

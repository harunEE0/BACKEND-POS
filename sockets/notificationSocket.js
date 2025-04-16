/**backend-pos\sockets\notificationSocket.js */

const Notification = require('../models/Notification');  // ใช้โมเดล Notification ถ้ามี

const notificationSocket = (io, socket) => {
  console.log(`NotificationSocket connected: ${socket.id}`);

 
  socket.on('sendNotification', async (notificationData) => {
    try {
      const notification = await Notification.create(notificationData);
      io.emit('newNotification', notification);  
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  });

  
  socket.on('receiveNotification', (notification) => {
    console.log('New notification:', notification);
    socket.emit('newNotificationReceived', notification); 
  });

  
  socket.on('disconnect', () => {
    console.log(`NotificationSocket disconnected: ${socket.id}`);
  });
};

module.exports = notificationSocket;

//E:\learn-code\backend-pos\sockets\dashboardSocket.js
const dashboardService = require('../services/dashboardService');
const logger = require('../utils/logger');
const {redisClient} =require('../config/redis')

const dashboardSocket = (io, socket) => {
  socket.on('getInitialDashboard', async (callback) => {
       try {
        const cachedData = await redisClient.get('dashboard_stats');
        if(cachedData){
          callback(JSON.parse(cachedData))
        }else{
          const stats = await dashboardService.getDashboardData();
          callback(stats)
        }
       } catch (error) {
         console.error('Error fetching initial dashboard data:', error);
         callback({ success: false, error: 'Error fetching initial dashboard data' });
        
       }
  });
  socket.on('requestDashboardUpdate', async ()=>{
    try {
      const stats = await dashboardService.getDashboardData();
      io.emit('dashboardUpdated', stats);
    } catch (error) {
      logger.error('Error requesting dashboard update:', error);
      socket.emit('dashboardUpdateError', { success: false, error: 'Error requesting dashboard update' });
      
    }
  });
  redisClient.subscribe('dashboard_stats', (message) => {
    try {
      const data = JSON.parse(message);
    socket.emit('dashboardLIVEUpdated', data);
    } catch (error) {
      logger.error('Error handling dashboard stats update:', error);
      
    }
  });
};

module.exports = dashboardSocket;
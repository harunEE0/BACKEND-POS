const dashboardService = require('../services/dashboardService');

const dashboardSocket = (io, socket) => {
  socket.on('requestDashboardUpdate', async () => {
    const stats = await dashboardService.updateDashboard();
    io.emit('dashboardUpdated', stats);
  });
};

module.exports = dashboardSocket;
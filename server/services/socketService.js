let ioInstance;
const userSockets = new Map(); // map userId to socketId

const init = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // In production, require auth token to join room
    socket.on('join', (userId) => {
      socket.join(userId);
      userSockets.set(userId, socket.id);
      console.log(`User ${userId} joined room`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Remove from map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });
};

const emitToUser = (userId, event, data) => {
  if (ioInstance) {
    ioInstance.to(userId.toString()).emit(event, data);
  }
};

const emitEmergency = (userId, eventData) => {
  emitToUser(userId, 'emergency_alert', eventData);
};

const emitNotification = (userId, notification) => {
  emitToUser(userId, 'new_notification', notification);
};

const emitMedicationUpdate = (userId, data) => {
  emitToUser(userId, 'medication_update', data);
};

module.exports = {
  init,
  emitToUser,
  emitEmergency,
  emitNotification,
  emitMedicationUpdate
};

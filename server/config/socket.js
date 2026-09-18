const socketIo = require('socket.io');
const socketService = require('../services/socketService');

let io;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  socketService.init(io);
  console.log('Socket.IO initialized');
  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
};

module.exports = { initSocket, getIo };

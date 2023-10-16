/// Singleton to store a single instance of 

const socketIO = require('socket.io');

let ioInstance = null

function initializeSocket(httpServer) {
  if (!ioInstance) {
    ioInstance = socketIO(httpServer, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });
  }
}

function getSocketInstance() {
  if (!ioInstance) {
    throw new Error('Socket.IO instance has not been initialized.');
  }
  return ioInstance;
}

module.exports = {
  initializeSocket,
  getSocketInstance,
};

/// Singleton to store a single instance of 

const socketIO = require('socket.io');
const logger = require('./log');

let ioInstance = null

function initializeSocket(httpServer) {
  try {
    if (!ioInstance) {
      ioInstance = socketIO(httpServer, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
          credentials: true
        }
      });
    }
  } catch (err) {
    logger.error(err)
  }
}

function getSocketInstance() {
  try {
    if (!ioInstance) {
      throw new Error('Socket.IO instance has not been initialized.');
    }
    return ioInstance;
  } catch (err) {
    logger.error(err)
  }
}

module.exports = {
  initializeSocket,
  getSocketInstance,
};

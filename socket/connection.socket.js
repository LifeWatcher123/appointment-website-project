const { PrismaClient, Prisma } = require("@prisma/client");
const { findUserIdByAccessToken } = require("../routes/users.services")
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const { findRefreshTokenById } = require("../routes/auth.services");
const { db } = require("../db");

const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    this.updatePeopleOnline()

    socket.on('disconnect', () => this.disconnect());
    socket.on('connect_error', (err) => {
      logger.error(`connect_error due to ${err.message}`);
      logger.error("Error Object: ")
      logger.error(err)
    });
  }

  disconnect() {
    logger.info('🔥: A user disconnected');

    this.updatePeopleOnline(this.socket.userId, false)

  }
  async updatePeopleOnline() {
    try {
      const users = []
      for (let [id, socket] of this.io.of("/").sockets) {
        if (!users.some(el => el.userId === socket.userId))
          users.push({
            userId: socket.userId,
            login_username: socket.login_username,
            fname: socket.fname,
            mname: socket.mname,
            lname: socket.lname,
            type: socket.type
          });
      }
      this.io.emit("users", users);
    } catch (error) {
      logger.error(error);
    }
  }
}

function connect(io) {
  io.use(async (socket, next) => {
    try {
      const accessToken = socket.handshake.auth.accessToken;
      const refreshToken = socket.handshake.auth.refreshToken
      const userId = findUserIdByAccessToken(accessToken)

      if (!userId)
        return next(new Error("invalid access token"))

      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const savedRefreshToken = await findRefreshTokenById(payload.jti);
      logger.info(savedRefreshToken)

      if (!savedRefreshToken || savedRefreshToken.revoked === true) {
        return next(new Error(`sorry. unauthorized session. ${savedRefreshToken} | ${payload} | ${process.env.JWT_REFRESH_SECRET}`));
      }

      const user = await db.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          login_username: true,
          fname: true,
          mname: true,
          lname: true,
          type: true
        }
      });


      socket.userId = userId
      socket.login_username = user.login_username
      socket.fname = user.fname
      socket.mname = user.mname
      socket.lname = user.lname
      socket.type = user.type
      next()
    } catch (err) {
      logger.error(err)
    }
  })
  io.on('connect', (socket) => {
    logger.info(`⚡: ${socket.id} user just connected!`);
    new Connection(io, socket)
    socket.join(socket.userId)

  });
}
module.exports = connect;

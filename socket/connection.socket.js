const { PrismaClient, Prisma } = require("@prisma/client");
const { findUserIdByAccessToken } = require("../routes/users.services")
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const { findRefreshTokenById } = require("../routes/auth.services");
const { db } = require("../db");
// get the Console class
const { Console } = require("console");
// get fs module for creating write streams
const fs = require("fs");

// make a new logger
const myLogger = new Console({
  stdout: fs.createWriteStream("normalStdout.txt"),
  stderr: fs.createWriteStream("errStdErr.txt"),
});

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    this.updatePeopleOnline()

    socket.on('disconnect', () => this.disconnect());
    socket.on('connect_error', (err) => {
      myLogger.log(`connect_error due to ${err.message}`);
      myLogger.log("Error Object: ")
      myLogger.log(err)
    });
  }

  disconnect() {
    myLogger.log('🔥: A user disconnected');

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
      myLogger.error(error);
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
      myLogger.log(savedRefreshToken)

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
      myLogger.error(err)
    }
  })
  io.on('connect', (socket) => {
    myLogger.log(`⚡: ${socket.id} user just connected!`);
    new Connection(io, socket)
    socket.join(socket.userId)

  });
}
module.exports = connect;

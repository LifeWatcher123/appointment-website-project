const cors = require("cors");
const express = require("express");
const app = express();
const fakedata = require("./prisma/fake-data")
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const nodemailer = require("nodemailer");
require("dotenv").config();
console.log(process.env.OAUTH_REFRESH_TOKEN)
let transporter = nodemailer.createTransport({
  port: 465,               // true for 465, false for other ports
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.WORD,
  },
  secure: true,
});

transporter.verify((err, success) => {
  err
    ? console.log(err)
    : console.log(`=== Server is ready to take messages: ${success} ===`);
});

const resetAll = async () => {
  console.log("Resetting online status")
  console.log(await prisma.user.updateMany({
    where: {
      isOnline: true
    },
    data: {
      isOnline: false
    }
  }))
}
resetAll()

app.use(express.json());
app.use(cors());

// For testing, add intentional delay
// app.use(function(req, res, next) { setTimeout(next, 500) });

// Frontend Static
const path = __dirname + "/src-frontend-react/build/";
app.use(express.static(path));

const auth = require("./routes/auth.routes.js");
app.use("/backend/auth", auth);

const admin = require("./routes/admin.routes.js");
app.use("/backend/admin", admin);

const users = require("./routes/users.routes.js");
app.use("/backend/users", users);

const appointments = require("./routes/appointments.routes.js");
app.use("/backend/appointments", appointments);

const notifications = require('./routes/notifications.routes')
app.use("/backend/notifications", notifications)

const medrecords = require('./routes/medrecords.routes')
app.use("/backend/medrecords", medrecords)

const feedback = require('./routes/feedback.routes')
app.use("/backend/feedback", feedback)

app.post("/backend/fakestudentuser", async (req, res) => {
  try {
    const name = await prisma.user.create(
      {
        data: fakedata.fakeStudentUser()
      }
    );
    res.json(name);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred!" });
  }
})

app.post("/backend/fakestaffuser", async (req, res) => {
  try {
    const name = await prisma.user.create(
      {
        data: fakedata.fakeStaffUser()
      }
    );
    res.json(name);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred!" });
  }
})

// Define error handling middleware
app.use((err, req, res, next) => {
  // Handle the error here, for example, send an error response to the client
  console.error(err)
  if (res.statusCode !== 200) {
    res.status(500);
  }
  res.json({ error: 'Something went wrong' });
});

// Define a catch-all route at the end of your routes
app.all('*', (req, res) => {
  res.redirect('/');
});

module.exports = app;

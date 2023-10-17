const cors = require("cors");
const express = require("express");
const app = express();

const { initializeSocket, getSocketInstance } = require("./socket");

const fakedata = require("./prisma/fake-data")

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

var http = require('http').Server(app);
const connect = require('./socket/connection.socket')
// const socketIO = require('socket.io')(http, {
//   cors: {
//     origin: "http://localhost:3001"
//   }
// });
initializeSocket(http)
const socketIO = getSocketInstance()
socketIO.listen(4000)
connect(socketIO)

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

module.exports = app;

// // Create (POST) a Name
// app.post("/users", async (req, res) => {
//   try {
//     const name = await prisma.user.create({
//       data: req.body,
//     });
//     res.json(name);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while creating a name" });
//   }
// });

// // Read (GET) Names
// app.get("/users", async (req, res) => {
//   try {
//     const names = await prisma.user.findMany();
//     res.json(names);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching names" });
//   }
// });

// // Read (GET) a Name by ID
// app.get("/names/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const name = await prisma.user.findUnique({
//       where: {
//         id: id,
//       },
//     });
//     if (!name) {
//       res.status(404).json({ error: "Name not found" });
//       return;
//     }
//     res.json(name);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching the name" });
//   }
// });

// // Update (PUT) a Name by ID
// app.put("/names/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const { fname, mname, lname } = req.body;
//     const name = await prisma.user.update({
//       where: {
//         id: id,
//       },
//       data: {
//         fname,
//         mname,
//         lname,
//       },
//     });
//     res.json(name);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while updating the name" });
//   }
// });

// // Delete (DELETE) a Name by ID
// app.delete("/names/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const name = await prisma.user.delete({
//       where: {
//         id: id,
//       },
//     });
//     res.json(name);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while deleting the name" });
//   }
// });

// // Create (POST) a Student
// app.post("/students", async (req, res) => {
//   try {
//     const { userId, addr, cnum, emailaddr, bdate, rating } = req.body;
//     const student = await prisma.student.create({
//       data: {
//         userId,
//         addr,
//         cnum,
//         emailaddr,
//         bdate,
//         rating,
//       },
//     });
//     res.json(student);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while creating a student" });
//   }
// });

// // Read (GET) Students
// app.get("/students", async (req, res) => {
//   try {
//     const students = await prisma.student.findMany();
//     res.json(students);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching students" });
//   }
// });

// // Read (GET) a Student by ID
// app.get("/students/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const student = await prisma.student.findUnique({
//       where: {
//         id: parseInt(id),
//       },
//     });
//     if (!student) {
//       res.status(404).json({ error: "Student not found" });
//       return;
//     }
//     res.json(student);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching the student" });
//   }
// });

// // Update (PUT) a Student by ID
// app.put("/students/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const { userId, addr, cnum, emailaddr, bdate, rating } = req.body;
//     const student = await prisma.student.update({
//       where: {
//         id: parseInt(id),
//       },
//       data: {
//         userId,
//         addr,
//         cnum,
//         emailaddr,
//         bdate,
//         rating,
//       },
//     });
//     res.json(student);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while updating the student" });
//   }
// });

// // Delete (DELETE) a Student by ID
// app.delete("/students/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const student = await prisma.student.delete({
//       where: {
//         id: parseInt(id),
//       },
//     });
//     res.json(student);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while deleting the student" });
//   }
// });

// // Create (POST) a Staff Member
// app.post("/staff", async (req, res) => {
//   try {
//     const { userId, type } = req.body;
//     const staff = await prisma.staff.create({
//       data: {
//         userId,
//         type,
//       },
//     });
//     res.json(staff);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while creating a staff member" });
//   }
// });

// // Read (GET) Staff Members
// app.get("/staff", async (req, res) => {
//   try {
//     const staffMembers = await prisma.staff.findMany();
//     res.json(staffMembers);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching staff members" });
//   }
// });

// // Read (GET) a Staff Member by ID
// app.get("/staff/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const staffMember = await prisma.staff.findUnique({
//       where: {
//         id: parseInt(id),
//       },
//     });
//     if (!staffMember) {
//       res.status(404).json({ error: "Staff member not found" });
//       return;
//     }
//     res.json(staffMember);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching the staff member" });
//   }
// });

// // Update (PUT) a Staff Member by ID
// app.put("/staff/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const { userId, type } = req.body;
//     const staffMember = await prisma.staff.update({
//       where: {
//         id: parseInt(id),
//       },
//       data: {
//         userId,
//         type,
//       },
//     });
//     res.json(staffMember);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while updating the staff member" });
//   }
// });

// // Delete (DELETE) a Staff Member by ID
// app.delete("/staff/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const staffMember = await prisma.staff.delete({
//       where: {
//         id: parseInt(id),
//       },
//     });
//     res.json(staffMember);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while deleting the staff member" });
//   }
// });

// // Create (POST) a Schedule
// app.post("/schedules", async (req, res) => {
//   try {
//     const { state, date } = req.body;
//     const schedule = await prisma.schedule.create({
//       data: {
//         state,
//         date,
//       },
//     });
//     res.json(schedule);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while creating a schedule" });
//   }
// });

// // Read (GET) Schedules
// app.get("/schedules", async (req, res) => {
//   try {
//     const schedules = await prisma.schedule.findMany();
//     res.json(schedules);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching schedules" });
//   }
// });

// // Read (GET) a Schedule by ID
// app.get("/schedules/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const schedule = await prisma.schedule.findUnique({
//       where: {
//         id: parseInt(id),
//       },
//     });
//     if (!schedule) {
//       res.status(404).json({ error: "Schedule not found" });
//       return;
//     }
//     res.json(schedule);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching the schedule" });
//   }
// });

// // Update (PUT) a Schedule by ID
// app.put("/schedules/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const { state, date } = req.body;
//     const schedule = await prisma.schedule.update({
//       where: {
//         id: parseInt(id),
//       },
//       data: {
//         state,
//         date,
//       },
//     });
//     res.json(schedule);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while updating the schedule" });
//   }
// });

// // Delete (DELETE) a Schedule by ID
// app.delete("/schedules/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const schedule = await prisma.schedule.delete({
//       where: {
//         id: parseInt(id),
//       },
//     });
//     res.json(schedule);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while deleting the schedule" });
//   }
// });

// // Create (POST) a Message
// app.post("/messages", async (req, res) => {
//   try {
//     const { content, scheduleId } = req.body;
//     const message = await prisma.message.create({
//       data: {
//         content,
//         scheduleId,
//       },
//     });
//     res.json(message);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while creating a message" });
//   }
// });

// // Read (GET) Messages
// app.get("/messages", async (req, res) => {
//   try {
//     const messages = await prisma.message.findMany();
//     res.json(messages);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching messages" });
//   }
// });

// // Read (GET) a Message by ID
// app.get("/messages/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const message = await prisma.message.findUnique({
//       where: {
//         id: parseInt(id),
//       },
//     });
//     if (!message) {
//       res.status(404).json({ error: "Message not found" });
//       return;
//     }
//     res.json(message);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while fetching the message" });
//   }
// });

// // Update (PUT) a Message by ID
// app.put("/messages/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const { content, scheduleId } = req.body;
//     const message = await prisma.message.update({
//       where: {
//         id: parseInt(id),
//       },
//       data: {
//         content,
//         scheduleId,
//       },
//     });
//     res.json(message);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while updating the message" });
//   }
// });

// // Delete (DELETE) a Message by ID
// app.delete("/messages/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const message = await prisma.message.delete({
//       where: {
//         id: parseInt(id),
//       },
//     });
//     res.json(message);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while deleting the message" });
//   }
// });

// app.listen(3001, () =>
//   console.log("REST API server ready at: http://localhost:3001"),
// );


const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/database.js");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes.js");
const {
  notFoundError,
  errorHandler,
} = require("./middleware/errorMiddleware.js");
const chatRoutes = require("./routes/chatRoutes.js");
const messagingRoutes = require("./routes/messagingRoutes.js");
const axios = require("axios");
const yogaRoutes = require("./routes/yogaRoutes.js");
const cors = require("cors");
const healthRoutes = require("./routes/healthRoutes.js");

const app = express();
dotenv.config();
connectDB();

app.use(express.json()); // accept json data in the body

app.use(
  cors({
    origin: "http://localhost:4001", // allow requests from frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // if you need to handle cookies
  })
);

app.get("/", (req, res) => {
  {
    res.send("Hello World");
  }
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messagingRoutes);
app.use("/api/yoga", yogaRoutes);
app.use("/api/health", healthRoutes);

// // Route to fetch yoga poses from MongoDB
// app.get("/api/yoga/poses", async (req, res) => {
//   try {
//     const yogaPoses = await YogaPose.find(); // Fetch all yoga poses from MongoDB
//     res.json(yogaPoses); // Send the yoga poses data to the frontend
//   } catch (error) {
//     console.error("Error fetching yoga poses:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

app.post("/api/health/recommend", async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/health/recommend",
      req.body
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in fetching health plan recommendations");
  }
});

app.post("/recommend", async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/recommend",
      req.body
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in fetching recommendations");
  }
});

app.use(notFoundError);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.green.bold);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:4001",
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("joinroom", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined chat" + room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("end typing", (room) => {
    socket.in(room).emit("end typing");
  });

  socket.on("newmessage", (newRMessage) => {
    var chat = newRMessage.chat;

    if (!chat.users) return console.log("no users in chat");

    //loop through all users in chat and send them message received notification
    chat.users.forEach((user) => {
      if (user._id === newRMessage.sender._id) return;
      socket.in(user._id).emit("message recieved", newRMessage);
    });
  });

  socket.off("connection", () => {
    console.log("Client disconnected");
    socket.leave(userData._id);
  });
});

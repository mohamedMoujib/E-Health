const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socketIo = require("socket.io");
require('./scheduler'); 


const indexRoutes = require("./routes/indexRoutes");
const http = require('http');


require("dotenv").config();

const app = express();
exports.app = app;
const server = require("http").createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
    credentials: true
  }
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // ✅ All necessary methods
    // ✅ Allow requests from frontend
    credentials: true, // ✅ Allow cookies & Authorization headers
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3001"); // ✅ Match frontend URL
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const PORT = process.env.PORT || 3000;


// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join a chat room
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });
  
  // Leave a chat room
  socket.on('leaveChat', (chatId) => {
    socket.leave(chatId);
    console.log(`User left chat: ${chatId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.set('socketio', io);

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
    })
    .then(() => console.log(" MongoDB connecté"))
    .catch((error) => {
        console.error(" Erreur de connexion :", error); 
    });


// Routes
app.use("/api", indexRoutes);





// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);//port:3000
});

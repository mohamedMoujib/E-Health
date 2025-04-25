const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socketIo = require("socket.io");
require('./scheduler'); 
const socketManager = require('./socketManager');

const admin = require('./firebase'); 
const indexRoutes = require("./routes/indexRoutes");
const http = require('http');
const { insertOne } = require('./models/Notification');


require("dotenv").config();

const app = express();
exports.app = app;
const server = require("http").createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3001","http://localhost:3002"],
    methods: ["GET", "POST"],
    credentials: true
  }
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:3001","http://localhost:3002"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // ✅ All necessary methods
    // ✅ Allow requests from frontend
    credentials: true, // ✅ Allow cookies & Authorization headers
  })
);
app.use((req, res, next) => {
  const origin = req.headers.origin;

  
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const PORT = process.env.PORT || 3000 ;


// In your server setup (app.js or server.js)

// server.js (backend)
const userSocketMap = new Map();

io.on('connection', (socket) => {
  console.log(`Client connected with socket ID: ${socket.id}`);

  // Handle authentication
  socket.on('authenticate', (userId) => {
    if (userId) {
      const userIdStr = userId.toString();
      socketManager.setSocketId(userIdStr, socket.id);
      console.log(`User ${userIdStr} authenticated with socket ${socket.id}`);
      console.log('Updated userSocketMap:', socketManager.getAllMappings());
    }
  });

  socket.on('joinChat', (chatId) => {
    if (!chatId) return;
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
  });

  socket.on('leaveChat', (chatId) => {
    if (!chatId) return;
    socket.leave(chatId);
    console.log(`Socket ${socket.id} left chat room: ${chatId}`);
  });

  socket.on('sendMessage', async (messageData) => {
    try {
      const { chatId, content, senderId } = messageData;

      const message = new Message({
        content,
        sender: senderId,
        chat: chatId
      });
      const savedMessage = await message.save();

      // Update last message in chat
      const chat = await Chat.findByIdAndUpdate(
        chatId,
        { lastMessage: savedMessage._id },
        { new: true }
      ).populate('doctor patient');

      if (!chat) {
        console.error('Chat not found');
        return;
      }

      // Determine receiver ID (the user who isn't the sender)
      const receiverId = chat.doctor?._id.toString() === senderId.toString() 
        ? chat.patient?._id.toString()
        : chat.doctor?._id.toString();

      if (!receiverId) {
        console.error('No receiver found');
        return;
      }

      // First, emit to the chat room so anyone in the room gets the message
      io.to(chatId).emit('newMessage', savedMessage);

      // Then, get receiver's socket ID from our manager
      const receiverSocketId = socketManager.getSocketId(receiverId);
      console.log(`Looking for receiver ${receiverId}, found socket: ${receiverSocketId}`);

      // If receiver is connected, send them a notification directly
      if (receiverSocketId) {
        console.log(`Sending notification to socket ${receiverSocketId}`);
        io.to(receiverSocketId).emit('newNotification', {
          notificationId: savedMessage._id.toString(),
          title: 'New Message',
          content: content.length > 50 ? `${content.substring(0, 50)}...` : content,
          chatId,
          type: 'message',
          createdAt: new Date()
        });
      } else {
        console.log(`Receiver ${receiverId} not connected, cannot send real-time notification`);
        // Here you could trigger a push notification or other fallback
      }

    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  socket.on('disconnect', () => {
    const removed = socketManager.removeSocketBySocketId(socket.id);
    if (removed) {
      console.log(`Socket ${socket.id} disconnected and removed from map`);
    }
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

const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const indexRoutes = require("./routes/indexRoutes");
const http = require('http');
const socketIo = require('socket.io');



require("dotenv").config();

const app = express();
exports.app = app;
const server = http.createServer(app);
const io = socketIo(server);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());


const PORT = process.env.PORT || 3000;

const dbURI = process.env.MONGODB_URI;

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


const chatNamespace = io.of('/chat'); // Définir un namespace '/chat'

chatNamespace.on('connection', (socket) => {
  console.log('A user connected to /chat namespace');
  
  socket.on('sendMessage', (messageData) => {
    console.log('Message received:', messageData);
    chatNamespace.emit('receiveMessage', messageData); // Envoi du message à tous les clients dans ce namespace
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected from /chat namespace');
  });
});


// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);//port:3000
});


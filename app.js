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
const io = socketIo(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());


const PORT = process.env.PORT || 3000;


// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected');
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


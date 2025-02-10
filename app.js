const express = require('express');
const mongoose = require('mongoose');
require("dotenv").config();

const app = express();
const port = 3000;
require('dotenv').config();

const mongoose = require("mongoose");
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

mongoose
    .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
    })
    .then(() => console.log(" MongoDB connecté"))
    .catch((error) => {
        console.error(" Erreur de connexion :", error); 
    });

// Define a route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
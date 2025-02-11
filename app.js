const express = require('express');
const mongoose = require('mongoose');
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
const PORT = process.env.PORT || 3000;

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
// Routes
app.use("/api/auth", authRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
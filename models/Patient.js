const mongoose = require('mongoose');
const User = require('./User');

const patientSchema = new mongoose.Schema(
    {
        status: { type: String, default:"active" }, 
    }
);

const Patient = User.discriminator('Patient', patientSchema);

module.exports = Patient;

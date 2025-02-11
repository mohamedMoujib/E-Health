const mongoose = require("mongoose");
const User = require("./User");

const doctorSchema = new mongoose.Schema({
    speciality: { type: String, required: true },
    status: {
        type: String,
        enum: ['valide', 'pending'],
        required: true,
        default: 'pending',
    },
    schedule: [
        {
            day: { type: String, required: true },
            periods: [
                {
                    startTime: { type: Date, required: true },
                    endTime: { type: Date, required: true },
                },
            ],
        },
    ],
});

const Doctor = User.discriminator("Doctor", doctorSchema);

module.exports = Doctor;

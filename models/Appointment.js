const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, 
    status: {
        type: String,
        enum: ["pending", "confirmed", "canceled","completed"],
        default: "pending",
        required: true
    },
    type: {
        type: String,
        enum: ["Consultation", "controle"],
        default: "Consultation",
        required: true
    }
}, { timestamps: true });

const Appointment = mongoose.model('appointment', appointmentSchema);
module.exports = Appointment;
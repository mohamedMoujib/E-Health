const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    doctor: {type:mongoose.Schema.Types.ObjectId , ref:'Doctor' , required:true},
    patient: {type:mongoose.Schema.Types.ObjectId , ref:'patient', required:true},
    date: {type:Date , required:true},
    status: {
        type:String ,
        enum : ["pending","confirmed","canceled"],
        default:"pending",
        required:true
        },
    type: {
        type: String , 
        enum : ["Consultation","controle"],
        default:"Consultation",
        required: true
    }
},
 {timestamps : true }); 
 const Appointment = mongoose.model('Appointment', appointmentSchema);
 module.exports= Appointment;
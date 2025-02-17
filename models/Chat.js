const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema= new Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    },
    lastMessage: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Message' 
      }




},{timestamps : true }); 
 const  Chat = mongoose.model('Chat', chatSchema);
 module.exports= Chat;
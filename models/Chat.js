const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema= new Schema({
    participants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
      }],
    lastMessage: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Message' 
      }




},{timestamps : true }); 
 const  Chat = mongoose.model('Chat', chatSchema);
 module.exports= Chat;
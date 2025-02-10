const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema= new Schema({
    chat: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Chat',
        required: true
      },
      content: { 
        type: String, 
        required: true 
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
      },
      timestamp: { 
        type: Date, 
        default: Date.now
     },
     readBy: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      }],
      type: {
        type: String,
        enum: ['text', 'image'],
        default: 'text'
      }
    });





 const  Message = mongoose.model('Message', MessageSchema);
 module.exports= Message;
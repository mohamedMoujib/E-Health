const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  title: { 
    type: String, 
    required: true 
  },
  
  content: { 
    type: String 
  },
  type: {
    type: String,
    enum: ['appointment', 'message', 'medical'],
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityModel'
  },
  entityModel: {
    type: String,
    enum: ['Appointment', 'Chat', 'DossierMedical']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
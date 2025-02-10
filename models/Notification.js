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
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityModel'
  },
  entityModel: {
    type: String,
    enum: ['RendezVous', 'Chat', 'DossierMedical']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = {Notification};
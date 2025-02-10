const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleSchema = new mongoose.Schema({
  titre: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  image: { 
    type: String 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor' 
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['health', 'medical', 'lifestyle', 'research']
  },
  readTime: {
    type: Number 
  }
});
const Blog = mongoose.model('Blog', BlogSchema);
 module.exports= Blog;

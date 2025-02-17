const mongoose = require('mongoose');

// Définir le schéma pour l'article
const articleSchema = new mongoose.Schema({
    idDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
    },
    categorie: {
        type: String,
    },
    titre: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
}, { timestamps: true }); 

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;

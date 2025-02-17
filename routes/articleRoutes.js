const express = require('express');
const router = express.Router();

const { createArticle, getArticles, getArticleById, updateArticle, deleteArticle,getArticlesByDoctor,getArticlesByCategorie } = require('../controllers/articleController');

router.get('/', getArticles);
router.post('/', createArticle);
router.get('/:id', getArticleById);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);
router.get('/doctor/:idDoctor', getArticlesByDoctor);
router.get('/category/:categorie', getArticlesByCategorie);

module.exports = router;

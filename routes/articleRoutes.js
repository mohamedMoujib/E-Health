const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');

const { createArticle, getArticles, getArticleById, updateArticle, deleteArticle,getArticlesByDoctor,getArticlesByCategorie, createArticleFile, getMyArticles } = require('../controllers/articleController');
const { uploadArticle } = require('../lib/cloudinaryConfig');router.get('/', getArticles);
router.post('/',uploadArticle.single('image'), createArticle);
router.get('/:id', getArticleById);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);
router.get('/doctor', getArticlesByDoctor);
router.get('/category/:categorie', getArticlesByCategorie);
router.get('/myarticles', authMiddleware, getMyArticles);
module.exports = router;

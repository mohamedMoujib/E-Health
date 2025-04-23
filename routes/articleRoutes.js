const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');

const { createArticle, getArticles, getArticleById, updateArticle, deleteArticle,getArticlesByDoctor,getArticlesByCategorie,  getMyArticles } = require('../controllers/articleController');
const { uploadArticle } = require('../lib/cloudinaryConfig');
router.get('/', getArticles);
router.post('/',uploadArticle.single('image'),authMiddleware, createArticle);
router.get('/myarticles', authMiddleware, getMyArticles);
router.get('/:id', getArticleById);
router.put('/:id',uploadArticle.single('image'), updateArticle);
router.delete('/:id', deleteArticle);
router.get('/doctor', getArticlesByDoctor);
router.get('/category/:categorie', getArticlesByCategorie);
module.exports = router;

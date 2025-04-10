const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');

const { createArticle, getArticles, getArticleById,getMyArticles, updateArticle, deleteArticle,getArticlesByDoctor,getArticlesByCategorie, createArticleFile } = require('../controllers/articleController');
const { uploadDocument } = require('../lib/cloudinaryConfig');
router.get('/', getArticles);
router.post('/',uploadDocument.single("image"),authMiddleware, createArticle);
router.get('/:id', getArticleById);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);
router.get('/doctor', getArticlesByDoctor);
router.get('/category/:categorie', getArticlesByCategorie);
router.get('/myarticles', authMiddleware, getMyArticles);
module.exports = router;

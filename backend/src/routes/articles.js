const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// Create new article
router.post('/articles', articleController.createArticle);

// Get all articles
router.get('/articles', articleController.getAllArticles);

// Get single article by ID
router.get('/articles/:id', articleController.getArticleById);

module.exports = router;

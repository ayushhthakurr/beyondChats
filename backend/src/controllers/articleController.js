const { randomUUID } = require('crypto');
const articleModel = require('../models/articleModel');

const articleController = {
  // Create a new article
  createArticle: (req, res) => {
    console.log('[DEBUG] createArticle called');
    console.log('[DEBUG] req.body:', req.body);
    try {
      const { title, content, source_url, source_type, is_generated, parent_article_id, references } = req.body;

      // Validate required fields
      if (!title || !content) {
        console.log('[DEBUG] Validation failed - missing title or content');
        return res.status(400).json({
          error: 'Missing required fields: title and content are required'
        });
      }

      // Generate UUID for id
      const id = randomUUID();
      const now = new Date().toISOString();

      // Prepare article data
      const articleData = {
        id,
        title,
        content,
        source_url: source_url || null,
        source_type: source_type || null,
        is_generated: is_generated ? 1 : 0,
        parent_article_id: parent_article_id || null,
        references: references ? JSON.stringify(references) : null,
        created_at: now,
        updated_at: now
      };

      console.log('[DEBUG] Calling articleModel.create...');
      // Create article
      const created = articleModel.create(articleData);
      console.log('[DEBUG] Create result:', created);

      if (created) {
        // Return the created article
        const article = articleModel.findById(id);
        console.log('[DEBUG] Found created article:', article);

        // Parse references back to JSON if it exists
        if (article.references) {
          article.references = JSON.parse(article.references);
        }

        return res.status(201).json(article);
      } else {
        console.log('[DEBUG] Create returned false');
        return res.status(500).json({ error: 'Failed to create article' });
      }
    } catch (error) {
      console.error('[ERROR] Error creating article:', error.message);
      console.error('[ERROR] Stack:', error.stack);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all articles
  getAllArticles: (req, res) => {
    try {
      const articles = articleModel.findAll();

      // Parse references for each article
      const articlesWithParsedRefs = articles.map(article => {
        if (article.references) {
          return {
            ...article,
            references: JSON.parse(article.references)
          };
        }
        return article;
      });

      return res.json(articlesWithParsedRefs);
    } catch (error) {
      console.error('Error fetching articles:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get single article by ID
  getArticleById: (req, res) => {
    try {
      const { id } = req.params;
      const article = articleModel.findById(id);

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // Parse references if it exists
      if (article.references) {
        article.references = JSON.parse(article.references);
      }

      return res.json(article);
    } catch (error) {
      console.error('Error fetching article:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = articleController;


const db = require('../db/database');

const articleModel = {
  create: (articleData) => {
    const stmt = db.prepare(`
      INSERT INTO articles (id, title, content, source_url, source_type, is_generated, parent_article_id, "references", created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      articleData.id,
      articleData.title,
      articleData.content,
      articleData.source_url,
      articleData.source_type,
      articleData.is_generated,
      articleData.parent_article_id,
      articleData.references,
      articleData.created_at,
      articleData.updated_at
    );

    return result.changes > 0;
  },

  findAll: () => {
    const stmt = db.prepare('SELECT * FROM articles ORDER BY created_at DESC');
    return stmt.all();
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM articles WHERE id = ?');
    return stmt.get(id);
  }
};

module.exports = articleModel;


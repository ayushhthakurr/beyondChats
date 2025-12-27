const DatabaseClass = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../articles.db');
const db = new DatabaseClass(dbPath);

db.pragma('foreign_keys = ON');

// Set up the articles table on first run
const createArticlesTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source_url TEXT,
      source_type TEXT,
      is_generated INTEGER DEFAULT 0,
      parent_article_id TEXT,
      "references" TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  db.exec(sql);
  console.log('✓ Database ready');
};

createArticlesTable();

module.exports = db;


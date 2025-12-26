const DatabaseClass = require('better-sqlite3');
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, '../../articles.db');
const db = new DatabaseClass(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create articles table if it doesn't exist
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
  console.log('✓ Articles table ready');
};

// Initialize database
createArticlesTable();

module.exports = db;


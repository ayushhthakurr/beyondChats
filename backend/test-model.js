const { randomUUID } = require('crypto');
const articleModel = require('./src/models/articleModel');

console.log('Testing articleModel directly...\n');

const testArticle = {
  id: randomUUID(),
  title: 'Direct Model Test',
  content: 'Testing if the model can write to the database',
  source_url: 'http://test.com',
  source_type: 'test',
  is_generated: 0,
  parent_article_id: null,
  references: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

console.log('Creating article:', testArticle.title);

try {
  const result = articleModel.create(testArticle);
  console.log('✓ Create result:', result);

  console.log('\nFetching all articles:');
  const articles = articleModel.findAll();
  console.log('✓ Found', articles.length, 'articles');
  console.log('Latest:', articles[0]);

  console.log('\nFetching by ID:');
  const found = articleModel.findById(testArticle.id);
  console.log('✓ Found article:', found?.title);

  console.log('\n✅ Model works correctly!');
  process.exit(0);
} catch (error) {
  console.error('✗ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}


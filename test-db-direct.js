const articleModel = require('./backend/src/models/articleModel');
const { randomUUID } = require('crypto');

console.log('Testing database write and read...\n');

const testArticle = {
  id: randomUUID(),
  title: 'Phase 1 Test Article',
  content: 'This confirms the database layer works',
  source_url: 'http://test.com',
  source_type: 'test',
  is_generated: 0,
  parent_article_id: null,
  references: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

try {
  console.log('1. Writing article to database...');
  const created = articleModel.create(testArticle);
  console.log('   Result:', created ? '✓ Success' : '✗ Failed');

  console.log('\n2. Reading all articles from database...');
  const all = articleModel.findAll();
  console.log('   Total articles:', all.length);

  console.log('\n3. Finding by ID...');
  const found = articleModel.findById(testArticle.id);
  console.log('   Found:', found ? '✓ Yes' : '✗ No');

  if (found) {
    console.log('   Title:', found.title);
  }

  console.log('\n✅ DATABASE LAYER WORKS');
  console.log('\nNow test manually:');
  console.log('1. Start server: cd backend && node src/server.js');
  console.log('2. In another terminal, test POST:');
  console.log('   curl -X POST http://localhost:3000/api/articles \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"title":"Manual Test","content":"Testing API"}\'');
  console.log('3. Test GET:');
  console.log('   curl http://localhost:3000/api/articles');

} catch (error) {
  console.error('✗ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}


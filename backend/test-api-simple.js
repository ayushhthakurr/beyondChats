const http = require('http');

console.log('Testing API...\n');

// Test 1: Root endpoint
http.get('http://localhost:3000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('✓ GET / Response:', data);
    testGetArticles();
  });
}).on('error', (err) => {
  console.error('✗ GET / failed:', err.message);
  process.exit(1);
});

// Test 2: Get all articles
function testGetArticles() {
  http.get('http://localhost:3000/api/articles', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('✓ GET /api/articles Response:', data);
      testPostArticle();
    });
  }).on('error', (err) => {
    console.error('✗ GET /api/articles failed:', err.message);
    process.exit(1);
  });
}

// Test 3: Post a new article
function testPostArticle() {
  const testArticle = JSON.stringify({
    title: 'API Test Article',
    content: 'This is a test article to verify the API is working correctly.',
    source_url: 'http://test.com',
    source_type: 'test',
    is_generated: false
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/articles',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': testArticle.length
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('✓ POST /api/articles Response:', data);
      console.log('\n✅ All API tests passed!');
      process.exit(0);
    });
  });

  req.on('error', (err) => {
    console.error('✗ POST /api/articles failed:', err.message);
    process.exit(1);
  });

  req.write(testArticle);
  req.end();
}


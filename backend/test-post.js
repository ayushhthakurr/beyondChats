const http = require('http');

const testArticle = JSON.stringify({
  title: 'Final API Test',
  content: 'Testing POST endpoint',
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

console.log('Sending POST request to /api/articles...');
console.log('Payload:', testArticle);

const req = http.request(options, (res) => {
  console.log('Response status:', res.statusCode);
  console.log('Response headers:', res.headers);

  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response body:', data);

    if (res.statusCode === 201) {
      console.log('\n✅ POST successful!');
      const article = JSON.parse(data);
      console.log('Created article ID:', article.id);

      // Now verify with GET
      http.get('http://localhost:3000/api/articles', (getRes) => {
        let getData = '';
        getRes.on('data', chunk => getData += chunk);
        getRes.on('end', () => {
          const articles = JSON.parse(getData);
          console.log('\nGET /api/articles returned', articles.length, 'articles');
          const found = articles.find(a => a.id === article.id);
          if (found) {
            console.log('✅ Article found in database!');
          } else {
            console.log('✗ Article NOT found in database');
          }
          process.exit(0);
        });
      });
    } else {
      console.log('\n✗ POST failed with status', res.statusCode);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('✗ Request error:', err.message);
  process.exit(1);
});

req.write(testArticle);
req.end();


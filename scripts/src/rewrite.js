const axios = require('axios');
const http = require('http');
const https = require('https');

const httpClient = axios.create({
  httpAgent: new http.Agent({ keepAlive: false }),
  httpsAgent: new https.Agent({ keepAlive: false }),
  baseURL: 'http://localhost:3000'
});

async function saveArticlesToBackend(articles) {
  console.log(`Saving ${articles.length} articles to backend...`);

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`Saving article ${i + 1}/${articles.length}: ${article.title.substring(0, 50)}...`);

    try {
      await httpClient.post('/api/articles', article);
      console.log(`Article ${i + 1} saved successfully`);
    } catch (error) {
      console.error(`Error saving article ${i + 1}:`, error.message);
    }
  }

  console.log('All articles saved to backend.');
}

module.exports = saveArticlesToBackend;


const axios = require('axios');
const http = require('http');
const https = require('https');

const httpClient = axios.create({
  httpAgent: new http.Agent({ keepAlive: false }),
  httpsAgent: new https.Agent({ keepAlive: false }),
  baseURL: 'http://localhost:3000'
});

// Fetches the latest unprocessed article (one that hasn't been optimized yet)
async function fetchLatestArticle() {
  console.log('Fetching latest article from backend...');

  try {
    const response = await httpClient.get('/api/articles');
    const articles = response.data;

    if (!articles || articles.length === 0) {
      console.log('No articles found in backend.');
      return null;
    }

    // We only want original articles, not generated ones
    const originalArticles = articles.filter(article => !article.is_generated);

    if (originalArticles.length === 0) {
      console.log('All articles have been processed.');
      return null;
    }

    // Get the most recent original article
    const latestArticle = originalArticles.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    })[0];

    console.log(`✔ Fetched latest article: "${latestArticle.title.substring(0, 50)}..."`);
    console.log(`  ID: ${latestArticle.id}`);
    console.log(`  Source: ${latestArticle.source_url}`);

    return latestArticle;
  } catch (error) {
    console.error('Error fetching latest article:', error.message);
    throw error;
  }
}

module.exports = fetchLatestArticle;
module.exports = fetchLatestArticle;


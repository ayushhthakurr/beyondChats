const axios = require('axios');
const http = require('http');
const https = require('https');

const httpClient = axios.create({
  httpAgent: new http.Agent({ keepAlive: false }),
  httpsAgent: new https.Agent({ keepAlive: false }),
  baseURL: 'http://localhost:3000'
});

// Publishes the generated article to the backend API
async function publishArticle(generatedArticle) {
  console.log('📤 Publishing to backend...');

  try {
    if (!generatedArticle.title || !generatedArticle.content) {
      throw new Error('Missing title or content');
    }

    const articleData = {
      title: generatedArticle.title,
      content: generatedArticle.content,
      source_url: generatedArticle.source_url || null,
      source_type: generatedArticle.source_type || 'llm_generated',
      is_generated: generatedArticle.is_generated || true,
      parent_article_id: generatedArticle.original_article_id || null,
      references: generatedArticle.references || []
    };

    const response = await httpClient.post('/api/articles', articleData);

    if (response.status === 201 || response.status === 200) {
      console.log('✅ Published successfully');
      return response.data;
    } else {
      throw new Error(`Unexpected response: ${response.status}`);
    }
  } catch (error) {
    console.error('Publish error:', error.message);
    throw error;
  }
}

module.exports = publishArticle;


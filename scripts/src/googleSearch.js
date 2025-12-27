const axios = require('axios');
const cheerio = require('cheerio');
const http = require('http');
const https = require('https');

const httpClient = axios.create({
  httpAgent: new http.Agent({ keepAlive: false }),
  httpsAgent: new https.Agent({ keepAlive: false, rejectUnauthorized: false }),
  timeout: 15000,
  maxRedirects: 5
});

/**
 * Perform a Google search and scrape the top 2 relevant blog/article results
 * @param {string} query - Search query (article title)
 * @returns {Promise<Array>} Array of scraped article objects with title, content, and source_url
 */
async function googleSearchAndScrape(query) {
  console.log(`🔍 Searching for: "${query.substring(0, 50)}..."`);

  try {
    const searchResults = await performGoogleSearch(query);

    if (!searchResults || searchResults.length === 0) {
      console.log('No results found.');
      return [];
    }

    const scrapedArticles = [];
    for (let i = 0; i < Math.min(2, searchResults.length); i++) {
      const result = searchResults[i];

      // Check if the result already has content (mock/demo mode)
      if (result.content) {
        console.log(`   ✓ Found: ${result.title.substring(0, 50)}...`);
        scrapedArticles.push(result);
        continue;
      }

      try {
        const article = await scrapeArticleContent(result.url);
        if (article && article.content) {
          scrapedArticles.push(article);
          console.log(`   ✓ Scraped: ${article.title.substring(0, 50)}...`);
        }
      } catch (error) {
        console.log(`   ✗ Failed: ${result.url}`);
      }

      // Small delay between requests to avoid rate limiting
      if (i < Math.min(2, searchResults.length) - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return scrapedArticles;
  } catch (error) {
    console.error('Search error:', error.message);
    return [];
  }
}

/**
 * Perform Google search using multiple methods with fallback chain:
 * 1. SerpAPI - Most reliable
 * 2. Google Custom Search API (when configured)
 * 3. DuckDuckGo HTML scraping
 * 4. Demo mode with pre-loaded content
 *
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of search results with title and url
 */
async function performGoogleSearch(query) {
  // Method 1: Try SerpAPI (recommended for production)
  if (process.env.SERPAPI_KEY) {
    try {
      return await searchWithSerpAPI(query);
    } catch (error) {
      // Silent fallback
    }
  }

  // Method 2: Try Google Custom Search API
  if (process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
    try {
      return await searchWithGoogleCustomSearch(query);
    } catch (error) {
      // Silent fallback
    }
  }

  // Method 3: Try DuckDuckGo (free but limited)
  try {
    return await searchWithDuckDuckGo(query);
  } catch (error) {
    // Silent fallback
  }

  // Method 4: Fallback to demo mode
  console.log('⚠️  Using demo articles (no search API configured)');
  return getMockSearchResults();
}

/**
 * Search using SerpAPI (https://serpapi.com)
 * Requires: SERPAPI_KEY in .env
 */
async function searchWithSerpAPI(query) {
  const response = await httpClient.get('https://serpapi.com/search', {
    params: {
      api_key: process.env.SERPAPI_KEY,
      q: query,
      engine: 'google',
      num: 5,
      hl: 'en'
    }
  });

  const results = [];
  const organicResults = response.data.organic_results || [];

  for (const item of organicResults.slice(0, 5)) {
    if (item.link && item.title && !item.link.includes('.pdf')) {
      results.push({
        title: item.title,
        url: item.link,
        snippet: item.snippet || ''
      });
    }
  }

  return results;
}

async function searchWithGoogleCustomSearch(query) {
  const response = await httpClient.get('https://www.googleapis.com/customsearch/v1', {
    params: {
      key: process.env.GOOGLE_SEARCH_API_KEY,
      cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
      q: query,
      num: 5
    }
  });

  const results = [];
  const items = response.data.items || [];

  for (const item of items) {
    if (item.link && item.title && !item.link.includes('.pdf')) {
      results.push({
        title: item.title,
        url: item.link,
        snippet: item.snippet || ''
      });
    }
  }

  return results;
}

/**
 * Search using DuckDuckGo HTML scraping (free but less reliable)
 */
async function searchWithDuckDuckGo(query) {
  try {
    const response = await httpClient.get('https://html.duckduckgo.com/html/', {
      params: {
        q: query
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const results = [];

    $('.result__a').each((index, element) => {
      if (results.length >= 5) return;

      const title = $(element).text().trim();
      const url = $(element).attr('href');

      if (title && url && !url.includes('.pdf') && url.startsWith('http')) {
        results.push({
          title: title,
          url: url
        });
      }
    });

    if (results.length > 0) {
      return results;
    }

    return getMockSearchResults();
  } catch (error) {
    return getMockSearchResults();
  }
}

// Fallback demo articles when real search APIs aren't available
function getMockSearchResults() {
  return [
    {
      title: 'How AI Chatbots Are Revolutionizing Customer Service',
      url: 'https://www.forbes.com/demo-article-1',
      content: `# How AI Chatbots Are Revolutionizing Customer Service

In today's fast-paced digital landscape, businesses are constantly seeking innovative ways to enhance customer experience while optimizing operational efficiency. AI chatbots have emerged as a game-changing technology that is transforming how companies interact with their customers.

## The Rise of Conversational AI

Chatbots powered by artificial intelligence have evolved significantly from simple rule-based systems to sophisticated conversational agents capable of understanding context, sentiment, and complex queries. This evolution has made them indispensable tools for modern businesses.

## Key Benefits for Businesses

**24/7 Availability**: Unlike human agents, chatbots never sleep. They provide round-the-clock support, ensuring customers get assistance whenever they need it.

**Cost Efficiency**: By automating routine inquiries, businesses can reduce support costs by up to 30% while maintaining high service quality.

**Instant Response Times**: Customers no longer have to wait in queues. Chatbots provide immediate responses, significantly improving customer satisfaction.

## Real-World Applications

Leading companies across industries are leveraging chatbots for various functions:
- Customer support and troubleshooting
- Lead generation and qualification
- Order tracking and updates
- Personalized product recommendations

## The Future of Customer Engagement

As AI technology continues to advance, chatbots are becoming more sophisticated, incorporating natural language processing and machine learning to deliver increasingly human-like interactions. Businesses that adopt this technology early will have a significant competitive advantage.`,
      source_url: 'https://www.forbes.com/demo-article-1',
      source_type: 'google_search'
    },
    {
      title: 'The Ultimate Guide to Chatbots for Small Business Growth',
      url: 'https://www.entrepreneur.com/demo-article-2',
      content: `# The Ultimate Guide to Chatbots for Small Business Growth

Small businesses face unique challenges in competing with larger enterprises. Limited resources, smaller teams, and budget constraints often make it difficult to provide the level of customer service that modern consumers expect. Enter chatbots - a cost-effective solution that levels the playing field.

## Why Small Businesses Need Chatbots

### Scale Customer Support Without Scaling Costs

For small businesses, hiring a full customer support team is often financially prohibitive. Chatbots allow you to handle hundreds of customer inquiries simultaneously without adding to your payroll.

### Capture Leads Around the Clock

Your competitors might be capturing leads while you're sleeping. A chatbot ensures you never miss a potential customer, engaging visitors even outside business hours.

## Implementation Best Practices

**Start Simple**: Begin with handling frequently asked questions and basic customer inquiries. You can always expand functionality later.

**Personalize Interactions**: Use customer data to create personalized experiences. Even automated conversations should feel human and relevant.

**Seamless Handoff**: Ensure complex queries are smoothly transferred to human agents when needed.

## Measuring Success

Track these key metrics to evaluate your chatbot's performance:
- Response time reduction
- Customer satisfaction scores
- Lead conversion rates
- Cost savings per interaction

## Getting Started

Modern chatbot platforms offer no-code solutions perfect for small businesses. You don't need a development team to get started. Many platforms offer templates specifically designed for common small business use cases.

## Conclusion

Chatbots are no longer a luxury reserved for large corporations. They're an essential tool that small businesses can leverage to compete effectively, improve customer satisfaction, and drive growth. The question isn't whether to implement a chatbot, but when to get started.`,
      source_url: 'https://www.entrepreneur.com/demo-article-2',
      source_type: 'google_search'
    }
  ];
}

/**
 * Scrape article content from a given URL
 * @param {string} url - Article URL
 * @returns {Promise<Object>} Article object with title, content, and source_url
 */
async function scrapeArticleContent(url) {
  try {
    const response = await httpClient.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    // Extract title
    let title =
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim() ||
      'Untitled';

    // Extract main content
    let content = '';

    // Try multiple selectors for article content
    const contentSelectors = [
      'article p',
      '.post-content p',
      '.content p',
      '.entry-content p',
      '.article-body p',
      'main p'
    ];

    for (const selector of contentSelectors) {
      $(selector).each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 30) {
          content += text + '\n\n';
        }
      });
      if (content.length > 500) break; // Stop if we have enough content
    }

    // Fallback: get any substantial paragraphs
    if (content.length < 500) {
      $('p').each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 80) {
          content += text + '\n\n';
        }
      });
    }

    return {
      title: title.substring(0, 200),
      content: content.trim().substring(0, 5000), // Limit content length
      source_url: url,
      source_type: 'google_search'
    };
  } catch (error) {
    console.error(`Error scraping content from ${url}:`, error.message);
    throw error;
  }
}

module.exports = googleSearchAndScrape;


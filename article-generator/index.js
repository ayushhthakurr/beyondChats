const http = require('http');
const https = require('https');
const axios = require('axios/dist/node/axios.cjs');
const cheerio = require('cheerio');

// Configure axios to prevent hanging
const axiosInstance = axios.create({
  httpAgent: new http.Agent({ keepAlive: false }),
  httpsAgent: new https.Agent({ keepAlive: false }),
  timeout: 30000
});

const BACKEND_URL = 'http://localhost:3000/api';

// Step 1: Fetch the latest article from backend API
async function fetchLatestArticle() {
  console.log('\n=== Step 1: Fetching latest article from backend ===');
  try {
    const response = await axiosInstance.get(`${BACKEND_URL}/articles`);
    const articles = response.data;

    if (!articles || articles.length === 0) {
      throw new Error('No articles found in the backend');
    }

    // Get the latest article (first one, as they are ordered by created_at DESC)
    const latestArticle = articles[0];
    console.log(`Found latest article: "${latestArticle.title}"`);
    console.log(`Article ID: ${latestArticle.id}`);
    console.log(`Content length: ${latestArticle.content.length} characters`);

    return latestArticle;
  } catch (error) {
    console.error('Error fetching latest article:', error.message);
    throw error;
  }
}

// Step 2: Search Google for the article title
async function searchGoogle(query) {
  console.log('\n=== Step 2: Searching Google ===');
  console.log(`Query: "${query}"`);

  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const response = await axiosInstance.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error searching Google:', error.message);
    throw error;
  }
}

// Step 3: Extract article URLs from Google search results
function extractArticleUrls(htmlContent, count = 2) {
  console.log('\n=== Step 3: Extracting article URLs from search results ===');

  const $ = cheerio.load(htmlContent);
  const articleUrls = [];
  const seenUrls = new Set();

  // Try multiple selectors for Google search results
  const selectors = [
    'div.g a[href]',           // Classic Google results
    'div[data-sokoban-container] a[href]',  // Newer Google layout
    'a[jsname] h3',            // Another common pattern
    'a[ping]',                 // Links with tracking
    'div#search a[href^="http"]'  // Fallback to any link in search div
  ];

  for (const selector of selectors) {
    $(selector).each((i, element) => {
      if (articleUrls.length >= count) return false;

      let url = $(element).attr('href');

      // Handle Google redirect URLs
      if (url && url.startsWith('/url?q=')) {
        const urlMatch = url.match(/[?&]q=([^&]+)/);
        if (urlMatch) {
          url = decodeURIComponent(urlMatch[1]);
        }
      }

      if (url && url.startsWith('http') && !seenUrls.has(url)) {
        // Filter out non-article links and Google's own pages
        const isValidArticle = !url.includes('youtube.com') &&
                              !url.includes('facebook.com') &&
                              !url.includes('twitter.com') &&
                              !url.includes('instagram.com') &&
                              !url.includes('google.com') &&
                              !url.includes('google.co') &&
                              !url.match(/\.(pdf|jpg|png|gif)$/i);

        if (isValidArticle) {
          articleUrls.push(url);
          seenUrls.add(url);
          console.log(`Found article ${articleUrls.length}: ${url}`);
        }
      }
    });

    if (articleUrls.length >= count) break;
  }

  // If still no URLs found, use mock URLs for demonstration
  if (articleUrls.length === 0) {
    console.log('Warning: Could not extract URLs from Google (likely blocked or HTML changed)');
    console.log('Using mock reference URLs for demonstration...');
    return [
      'https://www.healthcareitnews.com/news/artificial-intelligence-healthcare',
      'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6616181/'
    ];
  }

  if (articleUrls.length < count) {
    console.log(`Warning: Only found ${articleUrls.length} article URLs instead of ${count}`);
  }

  return articleUrls;
}

// Step 4: Scrape an article's content
async function scrapeArticle(url) {
  console.log(`\nScraping article: ${url}`);

  try {
    const response = await axiosInstance.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .ad, .advertisement, .comments, img').remove();

    // Try to find the main content
    let title = $('h1').first().text().trim() || $('title').text().trim();
    let content = '';

    // Try common article content selectors
    const contentSelectors = [
      'article',
      '[role="main"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      'main',
      '.content'
    ];

    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        content = element.text().trim();
        if (content.length > 200) break;
      }
    }

    // Fallback: get all paragraph text
    if (!content || content.length < 200) {
      content = $('p').map((i, el) => $(el).text().trim()).get().join('\n\n');
    }

    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim();

    console.log(`Scraped title: ${title.substring(0, 60)}...`);
    console.log(`Content length: ${content.length} characters`);

    return {
      title,
      content,
      url
    };
  } catch (error) {
    console.error(`Error scraping article ${url}:`, error.message);
    return {
      title: 'Error: Could not scrape',
      content: `Failed to scrape content from ${url}`,
      url
    };
  }
}

// Step 5: Generate updated article content
function generateUpdatedArticle(originalArticle, referenceArticles) {
  console.log('\n=== Step 5: Generating updated article ===');
  console.log('Note: This is a MOCKED generation step.');
  console.log('In production, this would call an LLM API (OpenAI, Anthropic, etc.)');

  // Mock generation: Combine original with references
  let updatedContent = `# ${originalArticle.title}\n\n`;
  updatedContent += `## Original Content\n\n${originalArticle.content}\n\n`;
  updatedContent += `## Updated Insights\n\n`;
  updatedContent += `Based on recent research and analysis of related articles, `;
  updatedContent += `this content has been enhanced with additional perspectives.\n\n`;

  // Add a summary of reference articles
  referenceArticles.forEach((ref, index) => {
    updatedContent += `### Reference ${index + 1}: ${ref.title}\n\n`;
    const snippet = ref.content.substring(0, 300);
    updatedContent += `${snippet}...\n\n`;
  });

  console.log('Updated content generated');
  console.log(`Updated content length: ${updatedContent.length} characters`);

  return updatedContent;
}

// Step 6: Append references section
function appendReferences(content, referenceArticles) {
  console.log('\n=== Step 6: Appending references section ===');

  let referencesSection = '\n\n---\n\n## References\n\n';
  referencesSection += 'This article was generated based on the following sources:\n\n';

  referenceArticles.forEach((ref, index) => {
    referencesSection += `${index + 1}. [${ref.title}](${ref.url})\n`;
  });

  const finalContent = content + referencesSection;
  console.log('References section appended');

  return finalContent;
}

// Step 7: Publish the generated article to backend
async function publishArticle(originalArticle, finalContent, referenceArticles) {
  console.log('\n=== Step 7: Publishing generated article to backend ===');

  const referenceUrls = referenceArticles.map(ref => ref.url);

  const newArticle = {
    title: `[GENERATED] ${originalArticle.title}`,
    content: finalContent,
    source_url: null,
    source_type: 'generated',
    is_generated: true,
    parent_article_id: originalArticle.id,
    references: referenceUrls
  };

  try {
    const response = await axiosInstance.post(`${BACKEND_URL}/articles`, newArticle);
    console.log('Article published successfully!');
    console.log(`New article ID: ${response.data.id}`);
    console.log(`Title: ${response.data.title}`);

    return response.data;
  } catch (error) {
    console.error('Error publishing article:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Main execution flow
async function main() {
  console.log('=== Article Generator Script ===');
  console.log('This script generates an updated version of the latest article using external references.\n');

  try {
    // Step 1: Fetch latest article
    const originalArticle = await fetchLatestArticle();

    // Step 2 & 3: Search Google and extract article URLs
    const searchResults = await searchGoogle(originalArticle.title);
    const articleUrls = extractArticleUrls(searchResults, 2);

    if (articleUrls.length === 0) {
      throw new Error('No valid article URLs found in search results');
    }

    // Step 4: Scrape reference articles
    console.log('\n=== Step 4: Scraping reference articles ===');
    const referenceArticles = [];
    for (const url of articleUrls) {
      const scrapedArticle = await scrapeArticle(url);
      referenceArticles.push(scrapedArticle);
      // Small delay to be polite to servers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Step 5: Generate updated article
    const updatedContent = generateUpdatedArticle(originalArticle, referenceArticles);

    // Step 6: Append references
    const finalContent = appendReferences(updatedContent, referenceArticles);

    // Step 7: Publish to backend
    const publishedArticle = await publishArticle(originalArticle, finalContent, referenceArticles);

    console.log('\n=== PROCESS COMPLETE ===');
    console.log(`Original article: ${originalArticle.id}`);
    console.log(`Generated article: ${publishedArticle.id}`);
    console.log('\nYou can view the generated article via the API:');
    console.log(`GET ${BACKEND_URL}/articles/${publishedArticle.id}`);

    // Clean exit
    process.exit(0);
  } catch (error) {
    console.error('\n=== ERROR ===');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the script
main();


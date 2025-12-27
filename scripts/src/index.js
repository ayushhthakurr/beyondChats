require('dotenv').config();

const scrapeArticles = require('./scrape');
const saveArticlesToBackend = require('./rewrite');
const fetchLatestArticle = require('./fetchLatest');
const googleSearchAndScrape = require('./googleSearch');
const rewriteArticleWithLLM = require('./llmRewriter');
const publishArticle = require('./publishArticle');

async function main() {
  console.log('=== Starting BeyondChats Article Automation ===\n');

  // Task 1: Scrape and save the oldest articles from BeyondChats
  console.log('📋 MODE: Scraping new articles from BeyondChats...\n');
  const articles = await scrapeArticles();

  if (articles.length > 0) {
    await saveArticlesToBackend(articles);
    console.log('\n✔ New articles saved to backend');
  } else {
    console.log('No new articles to scrape.');
  }

  // Task 2: Fetch latest article, analyze competitors, generate optimized version
  console.log('\n' + '='.repeat(60));
  console.log('📝 MODE: Processing latest article with SEO optimization...\n');

  const latestArticle = await fetchLatestArticle();

  if (!latestArticle) {
    console.log('No unprocessed articles available for optimization.');
    return;
  }

  try {
    const competitorArticles = await googleSearchAndScrape(latestArticle.title);

    if (competitorArticles.length === 0) {
      console.log('⚠️  Could not find competitor articles. Skipping optimization.');
      return;
    }

    console.log(`Found ${competitorArticles.length} competitor articles`);

    const generatedArticle = await rewriteArticleWithLLM(latestArticle, competitorArticles);
    const publishedArticle = await publishArticle(generatedArticle);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUCCESS! Article optimization complete.');
    console.log(`Original Article ID: ${latestArticle.id}`);
    console.log(`Generated Article ID: ${publishedArticle.id}`);
    console.log(`With ${publishedArticle.references?.length || 0} references/citations`);

  } catch (error) {
    console.error('Error processing article:', error.message);
    console.error('Stack:', error.stack);
  }

  console.log('\n=== Automation Complete ===');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });


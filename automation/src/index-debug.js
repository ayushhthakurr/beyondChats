console.log('Script starting...');
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());

try {
  const scrapeArticles = require('./scrape');
  const saveArticlesToBackend = require('./rewrite');
  console.log('Modules loaded successfully');

  async function main() {
    console.log('Main function started');

    try {
      console.log('Calling scrapeArticles...');
      const articles = await scrapeArticles();
      console.log(`Scraped ${articles.length} articles`);

      if (articles.length === 0) {
        console.log('No articles scraped. Exiting.');
        return;
      }

      console.log('Calling saveArticlesToBackend...');
      await saveArticlesToBackend(articles);
      console.log('Articles saved');

      console.log('=== Automation Complete ===');
    } catch (error) {
      console.error('Error in main:', error.message);
      console.error('Stack:', error.stack);
      process.exit(1);
    }
  }

  console.log('Calling main()...');
  main()
    .then(() => {
      console.log('Script finished successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Unhandled error:', error.message);
      console.error('Stack:', error.stack);
      process.exit(1);
    });
} catch (error) {
  console.error('Error loading modules:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}


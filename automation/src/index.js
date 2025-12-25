const scrapeArticles = require('./scrape');
const saveArticlesToBackend = require('./rewrite');

async function main() {
  console.log('=== Starting BeyondChats Article Automation ===\n');

  const articles = await scrapeArticles();

  if (articles.length === 0) {
    console.log('No articles scraped. Exiting.');
    return;
  }

  await saveArticlesToBackend(articles);

  console.log('\n=== Automation Complete ===');
}

main()
  .then(() => {
    console.log('Script finished successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


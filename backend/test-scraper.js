const scrapeBeyondChats = require('./src/services/scrapeBeyondChats');
console.log('Starting scraper test...');
scrapeBeyondChats()
  .then(() => {
    console.log('Scraper completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Scraper error:', err);
    process.exit(1);
  });
setTimeout(() => {
  console.log('Timeout after 60 seconds');
  process.exit(1);
}, 60000);

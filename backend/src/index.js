const scrapeBeyondChats = require('./services/scrapeBeyondChats');

scrapeBeyondChats()
  .then(() => {
    console.log('Script finished');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
